package com.educloud.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class FacultyRequest {
    @NotBlank
    private String name;
    @NotBlank
    @Email
    private String email;
    private String phone;
    private String password;
    @NotNull
    private Long departmentId;
    private String designation;
    private String status; // ACTIVE | ON_LEAVE | INACTIVE
    /** Subject ids this faculty should be assigned to teach (their own course/semester's class is inferred per-subject). */
    private List<Long> subjectIds;
}
