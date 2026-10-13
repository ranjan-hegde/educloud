package com.educloud.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class DepartmentResponse {
    private Long id;
    private String name;
    private String headName;
    private long facultyCount;
    private long studentCount;
}
