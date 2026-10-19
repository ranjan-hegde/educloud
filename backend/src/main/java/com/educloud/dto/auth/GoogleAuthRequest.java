package com.educloud.dto.auth;

import com.educloud.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String name;

    private Role role; // STUDENT | FACULTY | ADMIN (default to STUDENT if null)

    private String googleId;

    private String avatar;
}
