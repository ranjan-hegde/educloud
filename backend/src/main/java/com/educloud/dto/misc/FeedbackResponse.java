package com.educloud.dto.misc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class FeedbackResponse {
    private Long id;
    private String studentName;
    private String faculty;
    private String subject;
    private String message;
    private String status;
    private String reply;
    private LocalDateTime createdAt;
    private LocalDateTime repliedAt;
}
