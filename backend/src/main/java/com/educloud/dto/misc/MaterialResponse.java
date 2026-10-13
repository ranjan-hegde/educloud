package com.educloud.dto.misc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class MaterialResponse {
    private Long id;
    private String title;
    private String subject;
    private Long subjectId;
    private String faculty;
    private String type;
    private String fileUrl;
    private LocalDateTime uploadedAt;
}
