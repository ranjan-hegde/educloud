package com.educloud.service;

import com.educloud.entity.*;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Backend-only Gemini proxy. The API key lives ONLY here (read from an
 * environment variable / application.properties) and is never returned to
 * or requested by the frontend. Every answer is grounded in the CALLING
 * user's own authorized data — pulled server-side via CurrentUserService —
 * never in data the client claims about itself.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AiChatService {

    private final WebClient.Builder webClientBuilder;
    private final CurrentUserService currentUserService;
    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarksRepository marksRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final SubjectRepository subjectRepository;
    private final FacultySubjectAssignmentRepository assignmentAssignRepository;
    private final AttendanceSessionRepository sessionRepository;

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    @Value("${app.gemini.api-base}")
    private String apiBase;

    public String chat(String userMessage) {
        User user = currentUserService.getUser();
        String context = buildContext(user);

        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY is not configured — falling back to a context-only canned reply.");
            return fallbackReply(userMessage, context);
        }

        try {
            String prompt = "You are EduCloud AI, an intelligent, helpful academic assistant. " +
                    "You have two core capabilities:\n" +
                    "1. When the user asks about their academic records, attendance, marks, courses, or schedule, reference their personalized Context below.\n" +
                    "2. When the user asks ANY general knowledge, science, programming, history, current events, trivia, or conversational question (such as 'what is the hair color of Donald Trump'), answer directly, accurately, and naturally as a real AI assistant!\n\n" +
                    "Context about logged-in user:\n" + context + "\n\n" +
                    "User Question: " + userMessage;

            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt))))
            );

            WebClient client = webClientBuilder.build();
            Map response = client.post()
                    .uri(apiBase + "/models/" + model + ":generateContent?key=" + apiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(20))
                    .block();

            return extractText(response);
        } catch (Exception e) {
            log.error("Gemini call failed: {}", e.getMessage());
            return fallbackReply(userMessage, context);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map response) {
        try {
            List<Map> candidates = (List<Map>) response.get("candidates");
            Map content = (Map) candidates.get(0).get("content");
            List<Map> parts = (List<Map>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            return "Sorry, I couldn't generate a response right now. Please try again.";
        }
    }

    private String buildContext(User user) {
        return switch (user.getRole()) {
            case STUDENT -> buildStudentContext();
            case FACULTY -> buildFacultyContext();
            case ADMIN -> "The user is an administrator of the EduCloud platform.";
        };
    }

    private String buildStudentContext() {
        Student student = currentUserService.getStudent();
        List<Attendance> attendance = attendanceRepository.findByStudent(student);
        int total = attendance.size();
        int present = (int) attendance.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
        int pct = total == 0 ? 0 : Math.round(present * 100f / total);

        List<Subject> subjects = subjectRepository.findByCourseAndSemester(student.getCourse(), student.getSemester());
        List<Marks> marks = marksRepository.findByStudent(student);

        LocalDate today = LocalDate.now();
        long pendingAssignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getSchoolClass().getCourse().getId().equals(student.getCourse().getId())
                        && a.getSchoolClass().getSemester().equals(student.getSemester())
                        && submissionRepository.findByAssignmentAndStudent(a, student).isEmpty()
                        && !a.getDueDate().isBefore(today))
                .count();

        return "Student: " + student.getUser().getName() + " (" + student.getRollNo() + "), "
                + student.getCourse().getName() + " Semester " + student.getSemester() + ".\n"
                + "Overall attendance: " + pct + "%.\n"
                + "Enrolled subjects: " + subjects.stream().map(Subject::getName).toList() + ".\n"
                + "Marks recorded for " + marks.size() + " subject(s).\n"
                + "Pending assignments: " + pendingAssignments + ".";
    }

    private String buildFacultyContext() {
        Faculty faculty = currentUserService.getFaculty();
        List<FacultySubjectAssignment> assignments = assignmentAssignRepository.findByFaculty(faculty);
        long todaysSessions = sessionRepository.findByFacultyAndDate(faculty, LocalDate.now()).size();

        return "Faculty: " + faculty.getUser().getName() + ", " + faculty.getDepartment().getName() + " department.\n"
                + "Subjects taught: " + assignments.stream().map(a -> a.getSubject().getName()).distinct().toList() + ".\n"
                + "Classes today: " + todaysSessions + ".";
    }

    private String fallbackReply(String userMessage, String context) {
        return "I can see your current details:\n\n" + context +
                "\n\nI'm running in offline mode right now (no Gemini API key configured), so I can only share " +
                "the summary above rather than a fully generated answer to \"" + userMessage + "\". " +
                "Once GEMINI_API_KEY is set on the backend, I'll be able to answer more naturally.";
    }
}
