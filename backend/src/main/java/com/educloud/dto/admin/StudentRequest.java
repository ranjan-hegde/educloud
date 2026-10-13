package com.educloud.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentRequest {
    @NotBlank
    private String name;
    @NotBlank
    @Email
    private String email;
    private String phone;
    /** Only required when creating a brand-new student; ignored on update. */
    private String password;
    @NotNull
    private Long departmentId;
    @NotNull
    private Long courseId;
    @NotNull
    private Integer semester;
    private String status; // ACTIVE | INACTIVE
}
