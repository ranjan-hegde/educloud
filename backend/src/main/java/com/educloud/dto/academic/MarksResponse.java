package com.educloud.dto.academic;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class MarksResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long subjectId;
    private String subject;
    private Integer semester;
    private Integer internal;
    private Integer external;
    private int total;
    private String grade;
}
