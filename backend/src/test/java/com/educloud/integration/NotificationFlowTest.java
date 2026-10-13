package com.educloud.integration;

import com.educloud.support.BaseIntegrationTest;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificationFlowTest extends BaseIntegrationTest {

    @Test
    void announcementToAllStudentsCreatesNotificationForStudent() throws Exception {
        String adminToken = registerAdminAndGetToken();
        String studentToken = registerStudentAndGetToken();

        String body = """
                {"title":"Test Announcement","message":"Please read this.",
                 "category":"ACADEMIC","audienceType":"ALL_STUDENTS"}
                """;
        mockMvc.perform(post("/api/announcements").header("Authorization", "Bearer " + adminToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/notifications").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Test Announcement"));
    }

    @Test
    void announcementToAllFacultyDoesNotReachStudents() throws Exception {
        String adminToken = registerAdminAndGetToken();
        String studentToken = registerStudentAndGetToken();

        String body = """
                {"title":"Faculty Only Notice","message":"Staff meeting today.",
                 "category":"ACADEMIC","audienceType":"ALL_FACULTY"}
                """;
        mockMvc.perform(post("/api/announcements").header("Authorization", "Bearer " + adminToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/notifications").header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(0));
    }

    @Test
    void announcementRequiringTargetFailsWithoutOne() throws Exception {
        String adminToken = registerAdminAndGetToken();
        String body = """
                {"title":"Bad Announcement","message":"Missing target.",
                 "category":"ACADEMIC","audienceType":"SPECIFIC_DEPARTMENT"}
                """;
        mockMvc.perform(post("/api/announcements").header("Authorization", "Bearer " + adminToken)
                        .contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
    }
}
