package com.educloud.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserSummary {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role; // lowercase for the frontend: "student" | "faculty" | "admin"
    /** Role-specific profile id (Student.id / Faculty.id / Admin.id) — the frontend's own record id. */
    private Long profileId;
}
