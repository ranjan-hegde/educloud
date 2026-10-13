package com.educloud.service;

import com.educloud.dto.academic.*;
import com.educloud.entity.*;
import com.educloud.exception.BadRequestException;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final FacultySubjectAssignmentRepository assignmentAssignRepository;
    private final ClassStudentRepository classStudentRepository;
    private final StudentRepository studentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;
    private final CurrentUserService currentUserService;

    public List<AssignmentResponse> listAll() {
        return assignmentRepository.findAll().stream().map(a -> toResponse(a, null)).toList();
    }

    public List<AssignmentResponse> listForCurrentStudent() {
        Student student = currentUserService.getStudent();
        return assignmentRepository.findAll().stream()
                .filter(a -> a.getSchoolClass().getCourse().getId().equals(student.getCourse().getId())
                        && a.getSchoolClass().getSemester().equals(student.getSemester()))
                .map(a -> toResponse(a, student))
                .toList();
    }

    @Transactional
    public AssignmentResponse create(AssignmentRequest req) {
        Faculty faculty = currentUserService.getFaculty();
        Subject subject = subjectRepository.findById(req.getSubjectId()).orElseThrow(() -> new NotFoundException("Subject not found."));
        SchoolClass schoolClass = schoolClassRepository.findById(req.getSchoolClassId()).orElseThrow(() -> new NotFoundException("Class not found."));
        if (assignmentAssignRepository.findByFacultyAndSubjectAndSchoolClass(faculty, subject, schoolClass).isEmpty()) {
            throw new ForbiddenException("You are not assigned to teach this subject for this class.");
        }

        Assignment assignment = Assignment.builder()
                .title(req.getTitle()).subject(subject).schoolClass(schoolClass).faculty(faculty)
                .description(req.getDescription()).dueDate(req.getDueDate()).status(AssignmentStatus.PENDING)
                .build();
        Assignment savedAssignment = assignmentRepository.save(assignment);

        classStudentRepository.findBySchoolClass(schoolClass).forEach(cs -> {
            User user = cs.getStudent().getUser();
            notificationService.notifyUser(user, "New Assignment: " + savedAssignment.getTitle(),
                    "Due " + savedAssignment.getDueDate() + " for " + subject.getName() + ".",
                    NotificationCategory.ASSIGNMENTS, "ASSIGNMENT:" + savedAssignment.getId());
            emailService.sendAssignmentNotification(user.getEmail(), savedAssignment.getTitle(), savedAssignment.getDueDate().toString());
        });

        return toResponse(savedAssignment, null);
    }

    @Transactional
    public AssignmentResponse update(Long id, AssignmentRequest req) {
        Assignment assignment = assignmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Assignment not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!assignment.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only edit your own assignments.");
        }
        assignment.setTitle(req.getTitle());
        assignment.setDescription(req.getDescription());
        assignment.setDueDate(req.getDueDate());
        return toResponse(assignmentRepository.save(assignment), null);
    }

    @Transactional
    public void delete(Long id) {
        Assignment assignment = assignmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Assignment not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!assignment.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only delete your own assignments.");
        }
        assignmentRepository.delete(assignment);
    }

    @Transactional
    public SubmissionResponse submit(Long assignmentId, MultipartFile file) {
        Student student = currentUserService.getStudent();
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow(() -> new NotFoundException("Assignment not found."));

        if (submissionRepository.findByAssignmentAndStudent(assignment, student).isPresent()) {
            throw new BadRequestException("You have already submitted this assignment.");
        }

        FileStorageService.StoredFile stored = fileStorageService.store(file, "assignments/" + assignmentId);
        boolean late = LocalDate.now().isAfter(assignment.getDueDate());

        AssignmentSubmission submission = AssignmentSubmission.builder()
                .assignment(assignment).student(student).submittedAt(LocalDateTime.now())
                .fileUrl(stored.url()).fileName(stored.originalName())
                .status(late ? SubmissionStatus.LATE : SubmissionStatus.SUBMITTED)
                .build();
        submission = submissionRepository.save(submission);

        return toSubmissionResponse(submission);
    }

    public List<SubmissionResponse> getSubmissions(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId).orElseThrow(() -> new NotFoundException("Assignment not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!assignment.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only view submissions for your own assignments.");
        }
        return submissionRepository.findByAssignment(assignment).stream().map(this::toSubmissionResponse).toList();
    }

    @Transactional
    public SubmissionResponse gradeSubmission(Long submissionId, GradeSubmissionRequest req) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!submission.getAssignment().getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only grade submissions for your own assignments.");
        }
        submission.setMarksObtained(req.getMarksObtained());
        submission.setFacultyFeedback(req.getFeedback());
        submission.setStatus(SubmissionStatus.GRADED);
        submission = submissionRepository.save(submission);

        notificationService.notifyUser(submission.getStudent().getUser(),
                "Assignment graded: " + submission.getAssignment().getTitle(),
                "You scored " + req.getMarksObtained() + " marks.", NotificationCategory.ASSIGNMENTS,
                "SUBMISSION:" + submission.getId());

        return toSubmissionResponse(submission);
    }

    private AssignmentResponse toResponse(Assignment a, Student viewerStudent) {
        List<AssignmentSubmission> submissions = submissionRepository.findByAssignment(a);
        int totalStudents = classStudentRepository.findBySchoolClass(a.getSchoolClass()).size();
        String mySubmissionStatus = null;
        if (viewerStudent != null) {
            mySubmissionStatus = submissionRepository.findByAssignmentAndStudent(a, viewerStudent)
                    .map(s -> s.getStatus().name()).orElse("NOT_SUBMITTED");
        }
        boolean closed = LocalDate.now().isAfter(a.getDueDate()) && submissions.size() >= totalStudents;
        return AssignmentResponse.builder()
                .id(a.getId()).title(a.getTitle()).subject(a.getSubject().getName()).subjectId(a.getSubject().getId())
                .schoolClass(a.getSchoolClass().getDisplayName()).description(a.getDescription()).dueDate(a.getDueDate())
                .status(closed ? "CLOSED" : a.getStatus().name())
                .submissions(submissions.size()).totalStudents(totalStudents)
                .mySubmissionStatus(mySubmissionStatus)
                .build();
    }

    private SubmissionResponse toSubmissionResponse(AssignmentSubmission s) {
        return SubmissionResponse.builder()
                .id(s.getId()).assignmentId(s.getAssignment().getId())
                .studentName(s.getStudent().getUser().getName()).studentRollNo(s.getStudent().getRollNo())
                .submittedAt(s.getSubmittedAt()).fileUrl(s.getFileUrl()).fileName(s.getFileName())
                .status(s.getStatus().name()).marksObtained(s.getMarksObtained()).facultyFeedback(s.getFacultyFeedback())
                .build();
    }
}
