package com.educloud.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateAttendanceRequest {
    @NotBlank
    private String status; // PRESENT | ABSENT | LATE
}
