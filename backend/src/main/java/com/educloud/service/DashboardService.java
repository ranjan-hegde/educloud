package com.educloud.service;

import com.educloud.entity.*;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceRepository attendanceRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final MarksRepository marksRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final AnnouncementRepository announcementRepository;
    private final NotificationRepository notificationRepository;
    private final FacultySubjectAssignmentRepository assignmentAssignRepository;
    private final ClassStudentRepository classStudentRepository;
    private final FeedbackRepository feedbackRepository;
    private final FeeRepository feeRepository;
    private final CurrentUserService currentUserService;

    public Map<String, Object> studentDashboard() {
        Student student = currentUserService.getStudent();
        List<Attendance> attendance = attendanceRepository.findByStudent(student);
        int totalAtt = attendance.size();
        int presentAtt = (int) attendance.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
        int attendancePct = totalAtt == 0 ? 0 : Math.round(presentAtt * 100f / totalAtt);

        List<Subject> subjects = subjectRepository.findByCourseAndSemester(student.getCourse(), student.getSemester());
        List<Marks> marks = marksRepository.findByStudent(student);

        LocalDate today = LocalDate.now();
        long upcomingAssessments = assessmentRepository.findAll().stream()
                .filter(a -> a.getSchoolClass().getCourse().getId().equals(student.getCourse().getId())
                        && a.getSchoolClass().getSemester().equals(student.getSemester())
                        && !a.getDate().isBefore(today))
                .count();

        List<Assignment> classAssignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getSchoolClass().getCourse().getId().equals(student.getCourse().getId())
                        && a.getSchoolClass().getSemester().equals(student.getSemester()))
                .toList();
        long pendingAssignments = classAssignments.stream()
                .filter(a -> submissionRepository.findByAssignmentAndStudent(a, student).isEmpty() && !a.getDueDate().isBefore(today))
                .count();

        long unreadNotifications = notificationRepository.countByRecipientAndIsReadFalse(student.getUser());

        List<Fee> fees = feeRepository.findByStudent(student);
        java.math.BigDecimal balance = fees.stream().map(Fee::getBalance).reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        double marksPct = marks.isEmpty() ? 0 : marks.stream().mapToInt(Marks::getTotal).average().orElse(0);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("attendancePercentage", attendancePct);
        data.put("totalSubjects", subjects.size());
        data.put("marksPercentage", Math.round(marksPct * 100.0) / 100.0);
        data.put("upcomingAssessments", upcomingAssessments);
        data.put("pendingAssignments", pendingAssignments);
        data.put("unreadNotifications", unreadNotifications);
        data.put("feeBalance", balance);
        data.put("recentAnnouncements", announcementRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).limit(5)
                .map(a -> Map.of("id", a.getId(), "title", a.getTitle(), "createdAt", a.getCreatedAt())).toList());
        return data;
    }

    public Map<String, Object> facultyDashboard() {
        Faculty faculty = currentUserService.getFaculty();
        List<FacultySubjectAssignment> assignments = assignmentAssignRepository.findByFaculty(faculty);
        long distinctSubjects = assignments.stream().map(a -> a.getSubject().getId()).distinct().count();
        long distinctClasses = assignments.stream().map(a -> a.getSchoolClass().getId()).distinct().count();
        long totalStudents = assignments.stream().map(FacultySubjectAssignment::getSchoolClass).distinct()
                .mapToLong(c -> classStudentRepository.findBySchoolClass(c).size()).sum();

        LocalDate today = LocalDate.now();
        long todaysSessions = sessionRepository.findByFacultyAndDate(faculty, today).size();
        long pendingAssessments = assessmentRepository.findByFaculty(faculty).stream()
                .filter(a -> a.getStatus() != AssessmentStatus.COMPLETED).count();
        long pendingAssignments = assignmentRepository.findByFaculty(faculty).stream()
                .filter(a -> a.getStatus() == AssignmentStatus.PENDING).count();
        long newFeedback = feedbackRepository.findByFaculty(faculty).stream()
                .filter(f -> f.getStatus() == FeedbackStatus.NEW).count();
        long unreadNotifications = notificationRepository.countByRecipientAndIsReadFalse(faculty.getUser());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("assignedSubjects", distinctSubjects);
        data.put("assignedClasses", distinctClasses);
        data.put("totalStudents", totalStudents);
        data.put("todaysClasses", todaysSessions);
        data.put("pendingAssessments", pendingAssessments);
        data.put("pendingAssignments", pendingAssignments);
        data.put("newFeedback", newFeedback);
        data.put("unreadNotifications", unreadNotifications);
        return data;
    }

    public Map<String, Object> adminDashboard() {
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalClasses = schoolClassRepository.count();
        long totalSubjects = subjectRepository.count();

        List<Attendance> allAttendance = attendanceRepository.findAll();
        int total = allAttendance.size();
        int present = (int) allAttendance.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
        int overallAttendance = total == 0 ? 0 : Math.round(present * 100f / total);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalStudents", totalStudents);
        data.put("totalFaculty", totalFaculty);
        data.put("totalDepartments", totalDepartments);
        data.put("totalClasses", totalClasses);
        data.put("totalSubjects", totalSubjects);
        data.put("overallAttendancePercentage", overallAttendance);
        data.put("recentAnnouncements", announcementRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())).limit(5)
                .map(a -> Map.of("id", a.getId(), "title", a.getTitle(), "createdAt", a.getCreatedAt())).toList());
        return data;
    }
}
