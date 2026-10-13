package com.educloud.dto.misc;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
public class TimetableRequest {
    @NotNull
    private Long schoolClassId;
    @NotNull
    private Long subjectId;
    @NotNull
    private Long facultyId;
    @NotNull
    private DayOfWeek dayOfWeek;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
    private String room;
}
