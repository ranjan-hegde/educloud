package com.educloud.dto.misc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class AnnouncementResponse {
    private Long id;
    private String title;
    private String message;
    private String category;
    private String audienceType;
    private String audienceTarget;
    private String postedBy;
    private LocalDateTime createdAt;
}
