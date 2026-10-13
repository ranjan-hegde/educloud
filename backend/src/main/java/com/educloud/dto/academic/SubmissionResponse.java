package com.educloud.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class SubmissionResponse {
    private Long id;
    private Long assignmentId;
    private String studentName;
    private String studentRollNo;
    private LocalDateTime submittedAt;
    private String fileUrl;
    private String fileName;
    private String status;
    private Integer marksObtained;
    private String facultyFeedback;
}
