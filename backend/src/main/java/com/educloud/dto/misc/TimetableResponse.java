package com.educloud.dto.misc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class TimetableResponse {
    private Long id;
    private String schoolClass;
    private String subject;
    private String faculty;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private String room;
}
