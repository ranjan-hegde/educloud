package com.educloud.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private String rollNo;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String course;
    private Integer semester;
    private String status;
    private Integer attendance;
}
