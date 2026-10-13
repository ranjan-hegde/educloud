package com.educloud.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class FacultyProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String qualification;
    private String experience;
    private String status;
    private List<String> subjects;
}
