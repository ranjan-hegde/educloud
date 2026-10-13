package com.educloud.service;

import com.educloud.dto.attendance.*;
import com.educloud.entity.*;
import com.educloud.exception.BadRequestException;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import com.educloud.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ClassStudentRepository classStudentRepository;
    private final StudentRepository studentRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final CurrentUserService currentUserService;

    public List<AttendanceRecordResponse> getStudentAttendance() {
        Student student = currentUserService.getStudent();
        return attendanceRepository.findByStudent(student).stream().map(this::toRecord).toList();
    }

    public List<AttendanceRecordResponse> getClassAttendance(Long classId, LocalDate date) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
                .orElseThrow(() -> new NotFoundException("Class not found."));
        List<AttendanceSession> sessions = date != null
                ? sessionRepository.findBySchoolClassAndDate(schoolClass, date)
                : List.of();
        return sessions.stream()
                .flatMap(s -> attendanceRepository.findBySession(s).stream())
                .map(this::toRecord)
                .toList();
    }

    @Transactional
    public void markManualAttendance(ManualAttendanceRequest req) {
        Faculty faculty = currentUserService.getFaculty();
        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new NotFoundException("Subject not found."));
        SchoolClass schoolClass = schoolClassRepository.findById(req.getSchoolClassId())
                .orElseThrow(() -> new NotFoundException("Class not found."));

        boolean assigned = assignmentRepository.findByFacultyAndSubjectAndSchoolClass(faculty, subject, schoolClass).isPresent();
        if (!assigned) {
            throw new ForbiddenException("You are not assigned to teach this subject for this class.");
        }

        // Find-or-create today's manual session shell for this subject+class+date.
        // Using find-or-create (not "create a new session every save") is what prevents
        // the same date's attendance from being double-counted on repeated saves.
        AttendanceSession session = sessionRepository.findBySchoolClassAndDate(schoolClass, req.getDate()).stream()
                .filter(s -> s.getSubject().getId().equals(subject.getId()) && s.getFaculty().getId().equals(faculty.getId()))
                .findFirst()
                .orElseGet(() -> sessionRepository.save(AttendanceSession.builder()
                        .subject(subject)
                        .schoolClass(schoolClass)
                        .faculty(faculty)
                        .location(null)
                        .date(req.getDate())
                        .startTime(LocalTime.of(0, 0))
                        .endTime(LocalTime.of(23, 59))
                        .radiusMeters(null)
                        .qrToken(TokenGenerator.qrToken())
                        .status(SessionStatus.COMPLETED)
                        .build()));

        for (ManualAttendanceRequest.StudentMark mark : req.getRecords()) {
            Student student = studentRepository.findById(mark.getStudentId())
                    .orElseThrow(() -> new NotFoundException("Student not found: " + mark.getStudentId()));
            AttendanceStatus status;
            try {
                status = AttendanceStatus.valueOf(mark.getStatus().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid status: " + mark.getStatus());
            }

            Attendance attendance = attendanceRepository.findByStudentAndSession(student, session)
                    .orElse(Attendance.builder().student(student).session(session).markedBy(MarkedBy.MANUAL).build());
            attendance.setStatus(status);
            attendance.setMarkedBy(MarkedBy.MANUAL);
            attendance.setScanTime(LocalDateTime.now());
            attendanceRepository.save(attendance);
        }
    }

    @Transactional
    public AttendanceRecordResponse updateAttendance(Long id, UpdateAttendanceRequest req) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attendance record not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!attendance.getSession().getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only edit attendance for your own sessions.");
        }
        try {
            attendance.setStatus(AttendanceStatus.valueOf(req.getStatus().toUpperCase(Locale.ROOT)));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + req.getStatus());
        }
        attendanceRepository.save(attendance);
        return toRecord(attendance);
    }

    public AttendanceSummaryResponse getSummary() {
        Student student = currentUserService.getStudent();
        List<Attendance> records = attendanceRepository.findByStudent(student);
        int total = records.size();
        int present = (int) records.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
        int absent = total - present;
        int overall = total == 0 ? 0 : Math.round(present * 100f / total);
        return AttendanceSummaryResponse.builder().overall(overall).present(present).absent(absent).total(total).build();
    }

    public List<SubjectAttendanceResponse> getSubjectWise() {
        Student student = currentUserService.getStudent();
        List<Attendance> records = attendanceRepository.findByStudent(student);
        Map<Subject, List<Attendance>> bySubject = records.stream()
                .collect(Collectors.groupingBy(a -> a.getSession().getSubject()));

        return bySubject.entrySet().stream().map(e -> {
            Subject subject = e.getKey();
            List<Attendance> list = e.getValue();
            int total = list.size();
            int present = (int) list.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
            int absent = total - present;
            int pct = total == 0 ? 0 : Math.round(present * 100f / total);
            return SubjectAttendanceResponse.builder()
                    .subjectId(subject.getId())
                    .subject(subject.getName())
                    .present(present)
                    .absent(absent)
                    .total(total)
                    .percentage(pct)
                    .status(pct >= 75 ? "Good" : pct >= 60 ? "Warning" : "Critical")
                    .build();
        }).toList();
    }

    public List<TrendPoint> getTrend() {
        Student student = currentUserService.getStudent();
        List<Attendance> records = attendanceRepository.findByStudent(student);
        Map<String, List<Attendance>> byMonth = records.stream()
                .collect(Collectors.groupingBy(a -> a.getSession().getDate().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)));

        return byMonth.entrySet().stream().map(e -> {
            List<Attendance> list = e.getValue();
            int total = list.size();
            int present = (int) list.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
            int pct = total == 0 ? 0 : Math.round(present * 100f / total);
            return TrendPoint.builder().label(e.getKey()).percentage(pct).build();
        }).toList();
    }

    private AttendanceRecordResponse toRecord(Attendance a) {
        return AttendanceRecordResponse.builder()
                .id(a.getId())
                .studentId(a.getStudent().getRollNo())
                .studentName(a.getStudent().getUser().getName())
                .status(a.getStatus().name())
                .markedBy(a.getMarkedBy().name())
                .scanTime(a.getScanTime())
                .distanceMeters(a.getDistanceMeters())
                .build();
    }
}
