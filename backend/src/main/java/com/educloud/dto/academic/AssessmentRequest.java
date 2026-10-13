package com.educloud.dto.academic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class AssessmentRequest {
    @NotBlank
    private String title;
    @NotNull
    private Long subjectId;
    @NotNull
    private Long schoolClassId;
    private String type;
    @NotNull
    private LocalDate date;
    private LocalTime startTime;
    private String duration;
    private Integer maxMarks;
    private String instructions;
    private String status; // DRAFT | PUBLISHED | COMPLETED
}
