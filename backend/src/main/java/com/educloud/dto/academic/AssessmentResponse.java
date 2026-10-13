package com.educloud.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class AssessmentResponse {
    private Long id;
    private String title;
    private String subject;
    private Long subjectId;
    private String schoolClass;
    private String type;
    private LocalDate date;
    private LocalTime startTime;
    private String duration;
    private Integer maxMarks;
    private String instructions;
    private String status;
}
