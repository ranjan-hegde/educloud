package com.educloud.dto.academic;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarksRequest {
    @NotNull
    private Long studentId;
    @NotNull
    private Long subjectId;
    @NotNull
    private Integer semester;
    @NotNull
    @Min(0) @Max(30)
    private Integer internal;
    @NotNull
    @Min(0) @Max(70)
    private Integer external;
}
