package com.educloud.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CourseResponse {
    private Long id;
    private String name;
    private String department;
    private Long departmentId;
    private String duration;
    private long studentCount;
}
