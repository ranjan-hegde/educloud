package com.educloud.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class AttendanceSummaryResponse {
    private int overall;
    private int present;
    private int absent;
    private int total;
}
