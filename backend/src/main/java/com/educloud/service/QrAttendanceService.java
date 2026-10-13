package com.educloud.service;

import com.educloud.dto.attendance.*;
import com.educloud.entity.*;
import com.educloud.exception.BadRequestException;
import com.educloud.exception.ConflictException;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import com.educloud.util.GeoUtils;
import com.educloud.util.TokenGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

/**
 * Genuine QR + geolocation attendance validation. Every check the spec asked
 * for is a real, separately-testable condition below — nothing here trusts
 * anything the client sends except "this is the token I scanned" and "this
 * is where my GPS says I am"; identity always comes from the JWT via
 * CurrentUserService, never from the request body.
 */
@Service
@RequiredArgsConstructor
public class QrAttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRepository attendanceRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final LocationRepository locationRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final ClassStudentRepository classStudentRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final CurrentUserService currentUserService;

    @Transactional
    public SessionResponse createSession(CreateSessionRequest req) {
        Faculty faculty = currentUserService.getFaculty();

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new NotFoundException("Subject not found."));
        SchoolClass schoolClass = schoolClassRepository.findById(req.getSchoolClassId())
                .orElseThrow(() -> new NotFoundException("Class not found."));
        Location location = locationRepository.findById(req.getLocationId())
                .orElseThrow(() -> new NotFoundException("Location not found."));

        // A faculty member can only create a session for a subject/class they're actually assigned to.
        boolean assigned = assignmentRepository.findByFacultyAndSubjectAndSchoolClass(faculty, subject, schoolClass).isPresent();
        if (!assigned) {
            throw new ForbiddenException("You are not assigned to teach this subject for this class.");
        }

        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new BadRequestException("End time must be after start time.");
        }

        AttendanceSession session = AttendanceSession.builder()
                .subject(subject)
                .schoolClass(schoolClass)
                .faculty(faculty)
                .location(location)
                .date(req.getDate())
                .startTime(req.getStartTime())
                .endTime(req.getEndTime())
                .radiusMeters(req.getRadiusMeters() != null ? req.getRadiusMeters() : location.getRadiusMeters())
                .qrToken(TokenGenerator.qrToken())
                .status(computeInitialStatus(req.getDate(), req.getStartTime(), req.getEndTime()))
                .build();
        session = sessionRepository.save(session);

        return toResponse(session);
    }

    private SessionStatus computeInitialStatus(LocalDate date, LocalTime start, LocalTime end) {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();
        if (date.isBefore(today) || (date.isEqual(today) && now.isAfter(end))) return SessionStatus.COMPLETED;
        if (date.isEqual(today) && !now.isBefore(start) && !now.isAfter(end)) return SessionStatus.ACTIVE;
        return SessionStatus.SCHEDULED;
    }

    public List<SessionResponse> listSessionsForCurrentFaculty() {
        Faculty faculty = currentUserService.getFaculty();
        return sessionRepository.findByFaculty(faculty).stream().map(this::toResponse).toList();
    }

    public List<SessionResponse> listAllSessions() {
        return sessionRepository.findAll().stream().map(this::toResponse).toList();
    }

    public SessionResponse getSession(Long id) {
        return toResponse(getSessionOrThrow(id));
    }

    @Transactional
    public SessionResponse closeSession(Long id) {
        AttendanceSession session = getSessionOrThrow(id);
        Faculty faculty = currentUserService.getFaculty();
        if (!session.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only close your own attendance sessions.");
        }
        session.setStatus(SessionStatus.CLOSED);
        sessionRepository.save(session);
        return toResponse(session);
    }

    @Transactional
    public AttendanceRecordResponse markAttendance(MarkAttendanceRequest req) {
        Student student = currentUserService.getStudent();

        // 1 & 2. Session exists + QR token/session id is valid.
        AttendanceSession session = resolveSession(req.getSessionIdentifier());

        // 3 & 4. Session is active / not closed.
        if (session.getStatus() == SessionStatus.CLOSED) {
            throw new BadRequestException("This attendance session has been closed by the faculty.");
        }

        // 5. Current date must match the session's date.
        if (!session.getDate().isEqual(LocalDate.now())) {
            throw new BadRequestException("This attendance session is not active today.");
        }

        // 6. Current time must fall within the session's time window (also covers "not expired").
        LocalTime now = LocalTime.now();
        if (now.isBefore(session.getStartTime()) || now.isAfter(session.getEndTime())) {
            throw new BadRequestException("This attendance session is not currently open.");
        }

        // 7. Student is logged in — guaranteed by reaching this line (JWT-authenticated), via CurrentUserService.

        // 8. Student belongs to the assigned class.
        boolean enrolled = classStudentRepository.findByStudent(student)
                .map(cs -> cs.getSchoolClass().getId().equals(session.getSchoolClass().getId()))
                .orElse(false);
        if (!enrolled) {
            throw new ForbiddenException("You are not enrolled in the class this session belongs to.");
        }

        // 9. Student is enrolled in the subject (subjects belong to a course+semester; the class check above already
        //    guarantees this, but we double-check the subject truly belongs to the student's course/semester).
        if (!session.getSubject().getCourse().getId().equals(student.getCourse().getId())
                || !session.getSubject().getSemester().equals(student.getSemester())) {
            throw new ForbiddenException("This session's subject is not part of your curriculum.");
        }

        // 10. Student has not already marked attendance for this session.
        if (attendanceRepository.existsByStudentAndSession(student, session)) {
            throw new ConflictException("You have already marked attendance for this session.");
        }

        // 11 & 12. Student location is valid and within the allowed radius (Haversine — never trust a
        //          "verified" flag from the client, only the actual coordinates).
        double distance = GeoUtils.distanceMeters(
                session.getLocation().getLatitude(), session.getLocation().getLongitude(),
                req.getLatitude(), req.getLongitude());
        int allowedRadius = session.getRadiusMeters() != null ? session.getRadiusMeters() : 50;
        if (distance > allowedRadius) {
            throw new ForbiddenException(String.format(
                    "You are outside the allowed location radius (%.0fm away, %dm allowed).", distance, allowedRadius));
        }

        Attendance attendance = Attendance.builder()
                .student(student)
                .session(session)
                .status(AttendanceStatus.PRESENT)
                .markedBy(MarkedBy.QR)
                .scanTime(LocalDateTime.now())
                .studentLatitude(req.getLatitude())
                .studentLongitude(req.getLongitude())
                .distanceMeters(distance)
                .build();
        attendance = attendanceRepository.save(attendance);

        notificationService.notifyUser(student.getUser(), "Attendance Marked",
                "Your attendance for " + session.getSubject().getName() + " has been marked present.",
                NotificationCategory.ATTENDANCE, "ATTENDANCE_SESSION:" + session.getId());
        emailService.sendAttendanceNotification(student.getUser().getEmail(), session.getSubject().getName(), "Present");

        return toRecordResponse(attendance);
    }

    private AttendanceSession resolveSession(String identifier) {
        // Manually-typed session IDs are numeric; scanned QR payloads carry the opaque token.
        if (identifier.chars().allMatch(Character::isDigit)) {
            Optional<AttendanceSession> byId = sessionRepository.findById(Long.parseLong(identifier));
            if (byId.isPresent()) return byId.get();
        }
        return sessionRepository.findByQrToken(identifier)
                .orElseThrow(() -> new NotFoundException("No attendance session found for that code."));
    }

    public List<AttendanceRecordResponse> getStudentHistory() {
        Student student = currentUserService.getStudent();
        return attendanceRepository.findByStudent(student).stream().map(this::toRecordResponse).toList();
    }

    public List<AttendanceRecordResponse> getSessionRecords(Long sessionId) {
        AttendanceSession session = getSessionOrThrow(sessionId);
        return attendanceRepository.findBySession(session).stream().map(this::toRecordResponse).toList();
    }

    private AttendanceSession getSessionOrThrow(Long id) {
        return sessionRepository.findById(id).orElseThrow(() -> new NotFoundException("Attendance session not found."));
    }

    private SessionResponse toResponse(AttendanceSession s) {
        int total = classStudentRepository.findBySchoolClass(s.getSchoolClass()).size();
        int present = (int) attendanceRepository.findBySession(s).stream()
                .filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
        return SessionResponse.builder()
                .id(s.getId())
                .subject(s.getSubject().getName())
                .subjectId(s.getSubject().getId())
                .schoolClass(s.getSchoolClass().getDisplayName())
                .faculty(s.getFaculty().getUser().getName())
                .room(s.getLocation() != null ? s.getLocation().getRoom() : "—")
                .location(s.getLocation() != null ? s.getLocation().getName() : "Manual entry")
                .latitude(s.getLocation() != null ? s.getLocation().getLatitude() : null)
                .longitude(s.getLocation() != null ? s.getLocation().getLongitude() : null)
                .radius(s.getRadiusMeters())
                .date(s.getDate())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus().name())
                .qrToken(s.getQrToken())
                .present(present)
                .absent(Math.max(total - present, 0))
                .total(total)
                .build();
    }

    private AttendanceRecordResponse toRecordResponse(Attendance a) {
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
