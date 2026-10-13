package com.educloud.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LocationRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String room;
    @NotNull
    private Double latitude;
    @NotNull
    private Double longitude;
    private Integer radiusMeters;
}
