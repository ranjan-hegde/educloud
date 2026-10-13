package com.educloud.integration;

import com.educloud.support.BaseIntegrationTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthFlowTest extends BaseIntegrationTest {

    @Test
    void registerCreatesAccountAndReturnsToken() throws Exception {
        String email = "newstudent-" + unique() + "@test.com";
        String body = """
                {"name":"New Student","email":"%s","password":"Password123","role":"STUDENT",
                 "departmentId":%d,"courseId":%d,"semester":5}
                """.formatted(email, department.getId(), course.getId());

        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.role").value("student"));
    }

    @Test
    void duplicateEmailRegistrationIsRejected() throws Exception {
        String email = "dup-" + unique() + "@test.com";
        String body = """
                {"name":"Dup","email":"%s","password":"Password123","role":"STUDENT",
                 "departmentId":%d,"courseId":%d,"semester":5}
                """.formatted(email, department.getId(), course.getId());

        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void loginWithWrongPasswordIsRejected() throws Exception {
        String email = "wrongpw-" + unique() + "@test.com";
        String registerBody = """
                {"name":"WrongPw","email":"%s","password":"Password123","role":"STUDENT",
                 "departmentId":%d,"courseId":%d,"semester":5}
                """.formatted(email, department.getId(), course.getId());
        mockMvc.perform(post("/api/auth/register").contentType("application/json").content(registerBody))
                .andExpect(status().isCreated());

        String loginBody = """
                {"email":"%s","password":"totallyWrongPassword"}
                """.formatted(email);
        mockMvc.perform(post("/api/auth/login").contentType("application/json").content(loginBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meEndpointRequiresAValidToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meEndpointReturnsCurrentUserWithValidToken() throws Exception {
        String token = registerStudentAndGetToken();
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.role").value("student"));
    }

    @Test
    void garbageTokenIsRejected() throws Exception {
        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer not.a.real.token"))
                .andExpect(status().isUnauthorized());
    }
}
