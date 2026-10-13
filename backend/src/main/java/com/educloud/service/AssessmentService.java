package com.educloud.service;

import com.educloud.dto.academic.AssessmentRequest;
import com.educloud.dto.academic.AssessmentResponse;
import com.educloud.entity.*;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final ClassStudentRepository classStudentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final CurrentUserService currentUserService;

    public List<AssessmentResponse> listAll() {
        return assessmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<AssessmentResponse> listForCurrentStudent() {
        Student student = currentUserService.getStudent();
        return assessmentRepository.findAll().stream()
                .filter(a -> a.getSchoolClass().getCourse().getId().equals(student.getCourse().getId())
                        && a.getSchoolClass().getSemester().equals(student.getSemester()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AssessmentResponse create(AssessmentRequest req) {
        Faculty faculty = currentUserService.getFaculty();
        Subject subject = subjectRepository.findById(req.getSubjectId()).orElseThrow(() -> new NotFoundException("Subject not found."));
        SchoolClass schoolClass = schoolClassRepository.findById(req.getSchoolClassId()).orElseThrow(() -> new NotFoundException("Class not found."));
        if (assignmentRepository.findByFacultyAndSubjectAndSchoolClass(faculty, subject, schoolClass).isEmpty()) {
            throw new ForbiddenException("You are not assigned to teach this subject for this class.");
        }

        Assessment assessment = Assessment.builder()
                .title(req.getTitle()).subject(subject).schoolClass(schoolClass).faculty(faculty)
                .type(req.getType()).date(req.getDate()).startTime(req.getStartTime())
                .duration(req.getDuration()).maxMarks(req.getMaxMarks()).instructions(req.getInstructions())
                .status(req.getStatus() != null ? AssessmentStatus.valueOf(req.getStatus().toUpperCase(Locale.ROOT)) : AssessmentStatus.PUBLISHED)
                .build();
        assessment = assessmentRepository.save(assessment);

        notifyClass(schoolClass, "New assessment: " + assessment.getTitle(),
                "An assessment for " + subject.getName() + " has been scheduled on " + assessment.getDate() + ".",
                NotificationCategory.ACADEMIC);

        return toResponse(assessment);
    }

    @Transactional
    public AssessmentResponse update(Long id, AssessmentRequest req) {
        Assessment assessment = assessmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Assessment not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!assessment.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only edit your own assessments.");
        }
        assessment.setTitle(req.getTitle());
        assessment.setType(req.getType());
        assessment.setDate(req.getDate());
        assessment.setStartTime(req.getStartTime());
        assessment.setDuration(req.getDuration());
        assessment.setMaxMarks(req.getMaxMarks());
        assessment.setInstructions(req.getInstructions());
        if (req.getStatus() != null) assessment.setStatus(AssessmentStatus.valueOf(req.getStatus().toUpperCase(Locale.ROOT)));
        return toResponse(assessmentRepository.save(assessment));
    }

    @Transactional
    public void delete(Long id) {
        Assessment assessment = assessmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Assessment not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!assessment.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only delete your own assessments.");
        }
        assessmentRepository.delete(assessment);
    }

    private void notifyClass(SchoolClass schoolClass, String title, String message, NotificationCategory category) {
        classStudentRepository.findBySchoolClass(schoolClass).forEach(cs -> {
            User user = cs.getStudent().getUser();
            notificationService.notifyUser(user, title, message, category, null);
            emailService.sendAssessmentNotification(user.getEmail(), title, message);
        });
    }

    private AssessmentResponse toResponse(Assessment a) {
        return AssessmentResponse.builder()
                .id(a.getId()).title(a.getTitle()).subject(a.getSubject().getName()).subjectId(a.getSubject().getId())
                .schoolClass(a.getSchoolClass().getDisplayName()).type(a.getType()).date(a.getDate())
                .startTime(a.getStartTime()).duration(a.getDuration()).maxMarks(a.getMaxMarks())
                .instructions(a.getInstructions()).status(a.getStatus().name())
                .build();
    }
}
