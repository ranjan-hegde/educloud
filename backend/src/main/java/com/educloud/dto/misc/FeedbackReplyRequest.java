package com.educloud.dto.misc;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackReplyRequest {
    @NotBlank
    private String reply;
}
