package com.educloud.dto.attendance;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class ManualAttendanceRequest {
    @NotNull
    private Long subjectId;
    @NotNull
    private Long schoolClassId;
    @NotNull
    private LocalDate date;

    @NotEmpty
    private List<StudentMark> records;

    @Getter
    @Setter
    public static class StudentMark {
        @NotNull
        private Long studentId;
        @NotNull
        private String status; // PRESENT | ABSENT | LATE
    }
}
