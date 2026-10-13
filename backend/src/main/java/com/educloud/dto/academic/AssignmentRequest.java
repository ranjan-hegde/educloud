package com.educloud.dto.academic;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AssignmentRequest {
    @NotBlank
    private String title;
    @NotNull
    private Long subjectId;
    @NotNull
    private Long schoolClassId;
    private String description;
    @NotNull
    private LocalDate dueDate;
}
