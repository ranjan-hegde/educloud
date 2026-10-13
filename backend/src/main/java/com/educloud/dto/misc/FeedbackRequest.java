package com.educloud.dto.misc;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackRequest {
    private Long facultyId;
    private Long subjectId;
    @NotBlank
    private String message;
}
