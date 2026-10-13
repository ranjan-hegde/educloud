package com.educloud.service;

import com.educloud.dto.misc.AnnouncementRequest;
import com.educloud.dto.misc.AnnouncementResponse;
import com.educloud.entity.*;
import com.educloud.exception.BadRequestException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/**
 * Creating an Announcement fans out into individual Notification rows for
 * EXACTLY the users it targets — this is what makes "generate notifications
 * only for the related students" a real, enforced behavior rather than a
 * comment, and what makes recipient targeting (All Students / All Faculty /
 * Specific Department / Specific Course) actually restrict who sees it.
 */
@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final CurrentUserService currentUserService;

    public List<AnnouncementResponse> listAll() {
        return announcementRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public AnnouncementResponse create(AnnouncementRequest req) {
        User postedBy = currentUserService.getUser();
        AudienceType audienceType;
        NotificationCategory category;
        try {
            audienceType = AudienceType.valueOf(req.getAudienceType().toUpperCase(Locale.ROOT));
            category = NotificationCategory.valueOf(req.getCategory().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid category or audience type.");
        }
        if ((audienceType == AudienceType.SPECIFIC_DEPARTMENT || audienceType == AudienceType.SPECIFIC_COURSE)
                && (req.getAudienceTarget() == null || req.getAudienceTarget().isBlank())) {
            throw new BadRequestException("A department/course target is required for that audience type.");
        }

        Announcement announcement = Announcement.builder()
                .title(req.getTitle()).message(req.getMessage()).category(category)
                .audienceType(audienceType).audienceTarget(req.getAudienceTarget()).postedBy(postedBy)
                .build();
        announcement = announcementRepository.save(announcement);

        fanOutNotifications(announcement);

        return toResponse(announcement);
    }

    private void fanOutNotifications(Announcement a) {
        List<User> recipients = switch (a.getAudienceType()) {
            case ALL_STUDENTS -> studentRepository.findAll().stream().map(Student::getUser).toList();
            case ALL_FACULTY -> facultyRepository.findAll().stream().map(Faculty::getUser).toList();
            case SPECIFIC_DEPARTMENT -> java.util.stream.Stream.concat(
                    studentRepository.findAll().stream().filter(s -> s.getDepartment().getName().equalsIgnoreCase(a.getAudienceTarget())).map(Student::getUser),
                    facultyRepository.findAll().stream().filter(f -> f.getDepartment().getName().equalsIgnoreCase(a.getAudienceTarget())).map(Faculty::getUser)
            ).toList();
            case SPECIFIC_COURSE -> studentRepository.findAll().stream()
                    .filter(s -> s.getCourse().getName().equalsIgnoreCase(a.getAudienceTarget()))
                    .map(Student::getUser).toList();
        };

        for (User recipient : recipients) {
            notificationService.notifyUser(recipient, a.getTitle(), a.getMessage(), a.getCategory(), "ANNOUNCEMENT:" + a.getId());
            emailService.sendAnnouncementNotification(recipient.getEmail(), a.getTitle(), a.getMessage());
        }
    }

    @Transactional
    public AnnouncementResponse update(Long id, AnnouncementRequest req) {
        Announcement announcement = announcementRepository.findById(id).orElseThrow(() -> new NotFoundException("Announcement not found."));
        announcement.setTitle(req.getTitle());
        announcement.setMessage(req.getMessage());
        return toResponse(announcementRepository.save(announcement));
    }

    @Transactional
    public void delete(Long id) {
        if (!announcementRepository.existsById(id)) throw new NotFoundException("Announcement not found.");
        announcementRepository.deleteById(id);
    }

    private AnnouncementResponse toResponse(Announcement a) {
        return AnnouncementResponse.builder()
                .id(a.getId()).title(a.getTitle()).message(a.getMessage()).category(a.getCategory().name())
                .audienceType(a.getAudienceType().name()).audienceTarget(a.getAudienceTarget())
                .postedBy(a.getPostedBy().getName()).createdAt(a.getCreatedAt())
                .build();
    }
}
