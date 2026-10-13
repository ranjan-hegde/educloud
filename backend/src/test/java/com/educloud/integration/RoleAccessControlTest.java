package com.educloud.integration;

import com.educloud.support.BaseIntegrationTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Confirms role-based authorization actually blocks cross-role access —
 * the exact requirement "students access only their own data", "faculty
 * access only their assigned data", "admin can manage everything" — by
 * hitting the real, secured endpoints with real JWTs for each role rather
 * than mocking the security layer.
 */
class RoleAccessControlTest extends BaseIntegrationTest {

    @Test
    void studentCannotAccessAdminEndpoints() throws Exception {
        String studentToken = registerStudentAndGetToken();
        mockMvc.perform(get("/api/admin/students").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentCannotAccessFacultyEndpoints() throws Exception {
        String studentToken = registerStudentAndGetToken();
        mockMvc.perform(get("/api/faculty/me").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void facultyCannotAccessAdminEndpoints() throws Exception {
        var faculty = registerFacultyAndGetToken();
        mockMvc.perform(get("/api/admin/faculty").header("Authorization", "Bearer " + faculty.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void facultyCannotAccessStudentOnlyEndpoints() throws Exception {
        var faculty = registerFacultyAndGetToken();
        mockMvc.perform(get("/api/students/me").header("Authorization", "Bearer " + faculty.token()))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessAdminEndpoints() throws Exception {
        String adminToken = registerAdminAndGetToken();
        mockMvc.perform(get("/api/admin/students").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void studentCanAccessOwnProfile() throws Exception {
        String studentToken = registerStudentAndGetToken();
        mockMvc.perform(get("/api/students/me").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }
}
