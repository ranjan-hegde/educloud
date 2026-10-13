package com.educloud.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class SubjectAttendanceResponse {
    private Long subjectId;
    private String subject;
    private int present;
    private int absent;
    private int total;
    private int percentage;
    private String status;
}
