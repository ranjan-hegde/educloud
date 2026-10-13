package com.educloud.integration;

import com.educloud.support.BaseIntegrationTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class MarksAndDashboardTest extends BaseIntegrationTest {

    @Test
    void facultyCanCreateMarksForAssignedSubject() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentToken = registerStudentAndGetToken();
        Long studentId = studentRepository.findAll().stream()
                .mapToLong(s -> s.getId()).max().orElseThrow();

        String body = """
                {"studentId":%d,"subjectId":%d,"semester":5,"internal":25,"external":60}
                """.formatted(studentId, subject.getId());

        mockMvc.perform(post("/api/marks").header("Authorization", "Bearer " + faculty.token())
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.total").value(85))
                .andExpect(jsonPath("$.data.grade").value("A"));
    }

    @Test
    void marksAboveMaximumAreRejectedByValidation() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentId = String.valueOf(studentRepository.findAll().get(0).getId());

        // internal max is 30 — 999 must fail bean validation before it ever reaches the DB.
        String body = """
                {"studentId":%s,"subjectId":%d,"semester":5,"internal":999,"external":60}
                """.formatted(studentId, subject.getId());

        mockMvc.perform(post("/api/marks").header("Authorization", "Bearer " + faculty.token())
                        .contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void studentCannotCreateMarks() throws Exception {
        String studentToken = registerStudentAndGetToken();
        String body = """
                {"studentId":1,"subjectId":%d,"semester":5,"internal":20,"external":50}
                """.formatted(subject.getId());

        mockMvc.perform(post("/api/marks").header("Authorization", "Bearer " + studentToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentDashboardReturnsExpectedShape() throws Exception {
        String studentToken = registerStudentAndGetToken();
        mockMvc.perform(get("/api/dashboard/student").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.attendancePercentage").exists())
                .andExpect(jsonPath("$.data.totalSubjects").exists());
    }

    @Test
    void facultyDashboardReturnsExpectedShape() throws Exception {
        var faculty = registerFacultyAndGetToken();
        mockMvc.perform(get("/api/dashboard/faculty").header("Authorization", "Bearer " + faculty.token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.assignedSubjects").exists());
    }

    @Test
    void adminDashboardReturnsExpectedShape() throws Exception {
        String adminToken = registerAdminAndGetToken();
        mockMvc.perform(get("/api/dashboard/admin").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalStudents").exists());
    }
}
