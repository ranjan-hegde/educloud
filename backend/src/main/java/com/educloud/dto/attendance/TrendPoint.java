package com.educloud.dto.attendance;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class TrendPoint {
    private String label;
    private int percentage;
}
