package com.educloud.dto.academic;

import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GradeSubmissionRequest {
    @Min(0)
    private Integer marksObtained;
    private String feedback;
}
