package com.educloud.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String from;

    @Value("${app.mail.fail-silently}")
    private boolean failSilently;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send email to {}: {}", to, e.getMessage());
            if (!failSilently) {
                throw e;
            }
        }
    }

    public void sendRegistrationConfirmation(String to, String name) {
        send(to, "Welcome to EduCloud",
                "Hi " + name + ",\n\nYour EduCloud account has been created successfully. " +
                "You can now log in at " + frontendBaseUrl + ".\n\n— EduCloud");
    }

    public void sendPasswordResetEmail(String to, String resetToken) {
        String link = frontendBaseUrl + "/reset-password?token=" + resetToken;
        send(to, "Reset your EduCloud password",
                "We received a request to reset your password.\n\n" +
                "Click the link below (valid for 30 minutes):\n" + link +
                "\n\nIf you didn't request this, you can safely ignore this email.\n\n— EduCloud");
    }

    public void sendAssignmentNotification(String to, String assignmentTitle, String dueDate) {
        send(to, "New assignment: " + assignmentTitle,
                "A new assignment \"" + assignmentTitle + "\" has been posted. Due: " + dueDate + ".\n\n— EduCloud");
    }

    public void sendAssessmentNotification(String to, String assessmentTitle, String date) {
        send(to, "New assessment scheduled: " + assessmentTitle,
                "A new assessment \"" + assessmentTitle + "\" has been scheduled on " + date + ".\n\n— EduCloud");
    }

    public void sendAnnouncementNotification(String to, String title, String message) {
        send(to, "Announcement: " + title, message + "\n\n— EduCloud");
    }

    public void sendAttendanceNotification(String to, String subject, String status) {
        send(to, "Attendance recorded — " + subject,
                "Your attendance for " + subject + " has been marked as " + status + ".\n\n— EduCloud");
    }
}
