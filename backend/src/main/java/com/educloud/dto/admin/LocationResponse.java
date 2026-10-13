package com.educloud.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class LocationResponse {
    private Long id;
    private String name;
    private String room;
    private Double latitude;
    private Double longitude;
    private Integer radiusMeters;
}
