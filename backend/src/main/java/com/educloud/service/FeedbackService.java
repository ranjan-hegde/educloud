package com.educloud.service;

import com.educloud.dto.misc.FeedbackRequest;
import com.educloud.dto.misc.FeedbackResponse;
import com.educloud.entity.*;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FacultyRepository facultyRepository;
    private final SubjectRepository subjectRepository;
    private final NotificationService notificationService;
    private final CurrentUserService currentUserService;

    public List<FeedbackResponse> listForCurrentUser() {
        User user = currentUserService.getUser();
        return switch (user.getRole()) {
            case STUDENT -> feedbackRepository.findByStudent(currentUserService.getStudent()).stream().map(this::toResponse).toList();
            case FACULTY -> feedbackRepository.findByFaculty(currentUserService.getFaculty()).stream().map(this::toResponse).toList();
            case ADMIN -> feedbackRepository.findAll().stream().map(this::toResponse).toList();
        };
    }

    @Transactional
    public FeedbackResponse create(FeedbackRequest req) {
        Student student = currentUserService.getStudent();
        Faculty faculty = req.getFacultyId() != null
                ? facultyRepository.findById(req.getFacultyId()).orElseThrow(() -> new NotFoundException("Faculty not found."))
                : null;
        Subject subject = req.getSubjectId() != null
                ? subjectRepository.findById(req.getSubjectId()).orElseThrow(() -> new NotFoundException("Subject not found."))
                : null;

        Feedback feedback = Feedback.builder()
                .student(student).faculty(faculty).subject(subject).message(req.getMessage())
                .status(FeedbackStatus.NEW).build();
        feedback = feedbackRepository.save(feedback);

        if (faculty != null) {
            notificationService.notifyUser(faculty.getUser(), "New feedback received",
                    "A student left feedback" + (subject != null ? " on " + subject.getName() : "") + ".",
                    NotificationCategory.ACADEMIC, "FEEDBACK:" + feedback.getId());
        }

        return toResponse(feedback);
    }

    @Transactional
    public FeedbackResponse reply(Long id, String reply) {
        Feedback feedback = feedbackRepository.findById(id).orElseThrow(() -> new NotFoundException("Feedback not found."));
        User currentUser = currentUserService.getUser();
        if (currentUser.getRole() == Role.FACULTY) {
            Faculty faculty = currentUserService.getFaculty();
            if (feedback.getFaculty() == null || !feedback.getFaculty().getId().equals(faculty.getId())) {
                throw new ForbiddenException("You can only reply to feedback addressed to you.");
            }
        }
        feedback.setReply(reply);
        feedback.setRepliedAt(LocalDateTime.now());
        feedback.setStatus(FeedbackStatus.REVIEWED);
        feedback = feedbackRepository.save(feedback);

        notificationService.notifyUser(feedback.getStudent().getUser(), "Your feedback received a reply",
                reply, NotificationCategory.ACADEMIC, "FEEDBACK:" + feedback.getId());

        return toResponse(feedback);
    }

    @Transactional
    public void delete(Long id) {
        if (!feedbackRepository.existsById(id)) throw new NotFoundException("Feedback not found.");
        feedbackRepository.deleteById(id);
    }

    private FeedbackResponse toResponse(Feedback f) {
        return FeedbackResponse.builder()
                .id(f.getId()).studentName(f.getStudent().getUser().getName())
                .faculty(f.getFaculty() != null ? f.getFaculty().getUser().getName() : null)
                .subject(f.getSubject() != null ? f.getSubject().getName() : null)
                .message(f.getMessage()).status(f.getStatus().name()).reply(f.getReply())
                .createdAt(f.getCreatedAt()).repliedAt(f.getRepliedAt())
                .build();
    }
}
