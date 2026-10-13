package com.educloud.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AttendanceRecordResponse {
    private Long id;
    private String studentId;
    private String studentName;
    private String status;
    private String markedBy;
    private LocalDateTime scanTime;
    private Double distanceMeters;
}
