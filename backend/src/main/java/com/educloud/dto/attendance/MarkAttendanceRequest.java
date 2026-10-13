package com.educloud.dto.attendance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MarkAttendanceRequest {
    /** Either the full QR payload token or a manually-typed session id/token — resolved server-side. */
    @NotBlank
    private String sessionIdentifier;

    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
}
