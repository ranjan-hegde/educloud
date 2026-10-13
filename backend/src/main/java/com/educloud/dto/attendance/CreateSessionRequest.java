package com.educloud.dto.attendance;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateSessionRequest {
    @NotNull
    private Long subjectId;
    @NotNull
    private Long schoolClassId;
    @NotNull
    private Long locationId;
    @NotNull
    private LocalDate date;
    @NotNull
    private LocalTime startTime;
    @NotNull
    private LocalTime endTime;
    private Integer radiusMeters; // optional override of the location's default radius
}
