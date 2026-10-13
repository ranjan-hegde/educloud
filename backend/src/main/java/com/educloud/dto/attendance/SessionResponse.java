package com.educloud.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private String subject;
    private Long subjectId;
    private String schoolClass;
    private String faculty;
    private String room;
    private String location;
    private Double latitude;
    private Double longitude;
    private Integer radius;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String qrToken;
    private int present;
    private int absent;
    private int total;
}
