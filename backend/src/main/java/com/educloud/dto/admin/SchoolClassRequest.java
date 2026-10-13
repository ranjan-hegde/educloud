package com.educloud.dto.admin;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SchoolClassRequest {
    @NotNull
    private Long courseId;
    @NotNull
    private Integer semester;
    private String section;
}
