package com.educloud.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class FacultyResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String designation;
    private String status;
    private List<String> subjects;
}
