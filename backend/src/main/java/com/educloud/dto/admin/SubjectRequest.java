package com.educloud.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubjectRequest {
    @NotBlank
    private String name;
    private String code;
    @NotNull
    private Long courseId;
    @NotNull
    private Integer semester;
    private Integer credits;
    /** Optional: assign a faculty to teach this subject for that course+semester immediately. */
    private Long facultyId;
}
