package com.educloud.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class AssignmentResponse {
    private Long id;
    private String title;
    private String subject;
    private Long subjectId;
    private String schoolClass;
    private String description;
    private LocalDate dueDate;
    private String status;
    private int submissions;
    private int totalStudents;
    /** Only populated for a student caller: their own submission state, if any. */
    private String mySubmissionStatus;
}
