package com.educloud.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SchoolClassResponse {
    private Long id;
    private String name; // "BCA 5th Semester"
    private String course;
    private Long courseId;
    private Integer semester;
    private String section;
    private long studentCount;
}
