package com.educloud.integration;

import com.educloud.entity.AttendanceSession;
import com.educloud.entity.SessionStatus;
import com.educloud.repository.AttendanceSessionRepository;
import com.educloud.repository.FacultyRepository;
import com.educloud.support.BaseIntegrationTest;
import com.educloud.util.TokenGenerator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class QrAttendanceFlowTest extends BaseIntegrationTest {

    @Autowired
    private AttendanceSessionRepository sessionRepository;
    @Autowired
    private FacultyRepository facultyRepository;

    @Test
    void facultyCanCreateAttendanceSession() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String body = """
                {"subjectId":%d,"schoolClassId":%d,"locationId":%d,
                 "date":"%s","startTime":"00:00:00","endTime":"23:59:59"}
                """.formatted(subject.getId(), schoolClass.getId(), location.getId(), LocalDate.now());

        mockMvc.perform(post("/api/qr-attendance/sessions").header("Authorization", "Bearer " + faculty.token())
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    void studentCanMarkAttendanceWithinRadius() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentToken = registerStudentAndGetToken();
        AttendanceSession session = createActiveSession(faculty.id());

        String body = """
                {"sessionIdentifier":"%s","latitude":%f,"longitude":%f}
                """.formatted(session.getQrToken(), location.getLatitude(), location.getLongitude());

        mockMvc.perform(post("/api/qr-attendance/mark").header("Authorization", "Bearer " + studentToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PRESENT"));
    }

    @Test
    void studentOutsideRadiusIsRejected() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentToken = registerStudentAndGetToken();
        AttendanceSession session = createActiveSession(faculty.id());

        // ~1km away — well outside the 50m allowed radius.
        String body = """
                {"sessionIdentifier":"%s","latitude":%f,"longitude":%f}
                """.formatted(session.getQrToken(), location.getLatitude() + 0.01, location.getLongitude() + 0.01);

        mockMvc.perform(post("/api/qr-attendance/mark").header("Authorization", "Bearer " + studentToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void duplicateAttendanceIsRejected() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentToken = registerStudentAndGetToken();
        AttendanceSession session = createActiveSession(faculty.id());

        String body = """
                {"sessionIdentifier":"%s","latitude":%f,"longitude":%f}
                """.formatted(session.getQrToken(), location.getLatitude(), location.getLongitude());

        mockMvc.perform(post("/api/qr-attendance/mark").header("Authorization", "Bearer " + studentToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isOk());

        // Second attempt for the SAME session must be rejected — this is the
        // application-level check backed by the DB's unique(student, session) constraint.
        mockMvc.perform(post("/api/qr-attendance/mark").header("Authorization", "Bearer " + studentToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void expiredSessionRejectsAttendance() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentToken = registerStudentAndGetToken();

        // A session whose time window already ended.
        AttendanceSession session = sessionRepository.save(AttendanceSession.builder()
                .subject(subject).schoolClass(schoolClass).faculty(facultyRepository.findById(faculty.id()).orElseThrow())
                .location(location).date(LocalDate.now())
                .startTime(LocalTime.of(0, 0)).endTime(LocalTime.of(0, 1))
                .radiusMeters(50).qrToken(TokenGenerator.qrToken()).status(SessionStatus.COMPLETED)
                .build());

        String body = """
                {"sessionIdentifier":"%s","latitude":%f,"longitude":%f}
                """.formatted(session.getQrToken(), location.getLatitude(), location.getLongitude());

        mockMvc.perform(post("/api/qr-attendance/mark").header("Authorization", "Bearer " + studentToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void wrongDateSessionRejectsAttendance() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentToken = registerStudentAndGetToken();

        AttendanceSession session = sessionRepository.save(AttendanceSession.builder()
                .subject(subject).schoolClass(schoolClass).faculty(facultyRepository.findById(faculty.id()).orElseThrow())
                .location(location).date(LocalDate.now().minusDays(1))
                .startTime(LocalTime.of(0, 0)).endTime(LocalTime.of(23, 59))
                .radiusMeters(50).qrToken(TokenGenerator.qrToken()).status(SessionStatus.COMPLETED)
                .build());

        String body = """
                {"sessionIdentifier":"%s","latitude":%f,"longitude":%f}
                """.formatted(session.getQrToken(), location.getLatitude(), location.getLongitude());

        mockMvc.perform(post("/api/qr-attendance/mark").header("Authorization", "Bearer " + studentToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("not active today")));
    }

    private AttendanceSession createActiveSession(Long facultyId) {
        return sessionRepository.save(AttendanceSession.builder()
                .subject(subject).schoolClass(schoolClass).faculty(facultyRepository.findById(facultyId).orElseThrow())
                .location(location).date(LocalDate.now())
                .startTime(LocalTime.now().minusMinutes(10)).endTime(LocalTime.now().plusMinutes(50))
                .radiusMeters(50).qrToken(TokenGenerator.qrToken()).status(SessionStatus.ACTIVE)
                .build());
    }
}
