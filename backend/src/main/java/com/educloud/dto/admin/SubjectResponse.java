package com.educloud.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SubjectResponse {
    private Long id;
    private String name;
    private String code;
    private String course;
    private Long courseId;
    private Integer semester;
    private Integer credits;
    private String faculty;
}
