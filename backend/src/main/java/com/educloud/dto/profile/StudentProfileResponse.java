package com.educloud.dto.profile;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class StudentProfileResponse {
    private Long id;
    private String rollNo;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String course;
    private Integer semester;
    private String status;
    private String address;
    private LocalDate dob;
    private String bloodGroup;
    private String guardianName;
    private String guardianPhone;
}
