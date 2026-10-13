package com.educloud.dto.misc;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String message;
    @NotNull
    private String category; // matches NotificationCategory
    @NotNull
    private String audienceType; // ALL_STUDENTS | ALL_FACULTY | SPECIFIC_DEPARTMENT | SPECIFIC_COURSE
    private String audienceTarget; // department name or course name, required for the "specific" types
}
