package com.educloud.dto.profile;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateStudentProfileRequest {
    private String name;
    private String phone;
    private String address;
    private LocalDate dob;
    private String bloodGroup;
    private String guardianName;
    private String guardianPhone;
}
