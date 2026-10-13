package com.educloud.dto.misc;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaterialRequest {
    @NotBlank
    private String title;
    @NotNull
    private Long subjectId;
    private String type;
}
