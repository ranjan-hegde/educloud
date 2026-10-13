package com.educloud.dto.profile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateFacultyProfileRequest {
    private String name;
    private String phone;
    private String qualification;
    private String experience;
}
