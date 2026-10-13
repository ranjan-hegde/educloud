package com.educloud.integration;

import com.educloud.support.BaseIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AssignmentSubmissionTest extends BaseIntegrationTest {

    @Test
    void studentCanSubmitAssignmentOnce() throws Exception {
        var faculty = registerFacultyAndGetToken();
        String studentToken = registerStudentAndGetToken();

        String createBody = """
                {"title":"Test Assignment","subjectId":%d,"schoolClassId":%d,
                 "description":"Solve the exercises","dueDate":"%s"}
                """.formatted(subject.getId(), schoolClass.getId(), LocalDate.now().plusDays(7));

        String createResponse = mockMvc.perform(post("/api/assignments").header("Authorization", "Bearer " + faculty.token())
                        .contentType("application/json").content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        JsonNode node = objectMapper.readTree(createResponse);
        long assignmentId = node.get("data").get("id").asLong();

        MockMultipartFile file = new MockMultipartFile("file", "homework.pdf", "application/pdf", "content".getBytes());

        mockMvc.perform(multipart("/api/assignments/" + assignmentId + "/submit")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"));

        // A second submission for the same assignment by the same student must be rejected.
        MockMultipartFile secondFile = new MockMultipartFile("file", "homework2.pdf", "application/pdf", "more content".getBytes());
        mockMvc.perform(multipart("/api/assignments/" + assignmentId + "/submit")
                        .file(secondFile)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void facultyCannotCreateAssignmentForUnassignedSubject() throws Exception {
        var faculty = registerFacultyAndGetToken();
        // Create a second subject this faculty is NOT assigned to.
        var otherSubject = subjectRepository.save(com.educloud.entity.Subject.builder()
                .name("Unassigned Subject").code("X" + unique()).course(course).semester(5).credits(4).build());

        String body = """
                {"title":"Should Fail","subjectId":%d,"schoolClassId":%d,
                 "description":"x","dueDate":"%s"}
                """.formatted(otherSubject.getId(), schoolClass.getId(), LocalDate.now().plusDays(7));

        mockMvc.perform(post("/api/assignments").header("Authorization", "Bearer " + faculty.token())
                        .contentType("application/json").content(body))
                .andExpect(status().isForbidden());
    }
}
