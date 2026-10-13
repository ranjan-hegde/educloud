package com.educloud.support;

import com.educloud.entity.*;
import com.educloud.repository.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Common scaffolding for end-to-end tests: a real Spring context, a real
 * MockMvc-driven HTTP layer, and an in-memory H2 database — no mocking of
 * security or persistence, so these tests exercise the actual JWT/role
 * logic exactly as it runs in production.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected DepartmentRepository departmentRepository;
    @Autowired
    protected CourseRepository courseRepository;
    @Autowired
    protected SchoolClassRepository schoolClassRepository;
    @Autowired
    protected SubjectRepository subjectRepository;
    @Autowired
    protected FacultySubjectAssignmentRepository assignmentRepository;
    @Autowired
    protected ClassStudentRepository classStudentRepository;
    @Autowired
    protected LocationRepository locationRepository;
    @Autowired
    protected StudentRepository studentRepository;
    @Autowired
    protected FacultyRepository facultyRepository;

    protected Department department;
    protected Course course;
    protected SchoolClass schoolClass;
    protected Subject subject;
    protected Location location;

    @BeforeEach
    void setUpCatalog() {
        department = departmentRepository.save(Department.builder().name("Computer Applications " + unique()).headName("Dr. Head").build());
        course = courseRepository.save(Course.builder().name("BCA " + unique()).department(department).duration("3 Years").build());
        schoolClass = schoolClassRepository.save(SchoolClass.builder().course(course).semester(5).section("A").build());
        subject = subjectRepository.save(Subject.builder().name("Java Programming").code("CA" + unique()).course(course).semester(5).credits(4).build());
        location = locationRepository.save(Location.builder().name("Lab 1").room("Lab 1").latitude(12.29581).longitude(76.63929).radiusMeters(50).build());
    }

    protected String unique() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    protected String registerStudentAndGetToken() throws Exception {
        String email = "student-" + unique() + "@test.com";
        String body = """
                {
                  "name": "Test Student",
                  "email": "%s",
                  "password": "Password123",
                  "role": "STUDENT",
                  "departmentId": %d,
                  "courseId": %d,
                  "semester": 5
                }
                """.formatted(email, department.getId(), course.getId());

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String token = extractToken(response);
        Long studentId = extractProfileId(response);
        Student student = studentRepository.findById(studentId).orElseThrow();
        classStudentRepository.save(ClassStudent.builder().student(student).schoolClass(schoolClass).build());
        return token;
    }

    protected TokenAndId registerFacultyAndGetToken() throws Exception {
        String email = "faculty-" + unique() + "@test.com";
        String body = """
                {
                  "name": "Test Faculty",
                  "email": "%s",
                  "password": "Password123",
                  "role": "FACULTY",
                  "departmentId": %d
                }
                """.formatted(email, department.getId());

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String token = extractToken(response);
        Long facultyId = extractProfileId(response);
        Faculty faculty = facultyRepository.findById(facultyId).orElseThrow();
        assignmentRepository.save(FacultySubjectAssignment.builder().faculty(faculty).subject(subject).schoolClass(schoolClass).build());
        return new TokenAndId(token, facultyId);
    }

    protected String registerAdminAndGetToken() throws Exception {
        String email = "admin-" + unique() + "@test.com";
        String body = """
                {
                  "name": "Test Admin",
                  "email": "%s",
                  "password": "Password123",
                  "role": "ADMIN"
                }
                """.formatted(email);

        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return extractToken(response);
    }

    protected String extractToken(String json) throws Exception {
        JsonNode node = objectMapper.readTree(json);
        return node.get("data").get("token").asText();
    }

    protected Long extractProfileId(String json) throws Exception {
        JsonNode node = objectMapper.readTree(json);
        return node.get("data").get("user").get("profileId").asLong();
    }

    public record TokenAndId(String token, Long id) {}
}
