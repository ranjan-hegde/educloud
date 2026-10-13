package com.educloud.controller;

import com.educloud.dto.ai.ChatRequest;
import com.educloud.dto.ai.ChatResponse;
import com.educloud.dto.common.ApiResponse;
import com.educloud.service.AiChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(@Valid @RequestBody ChatRequest request) {
        String reply = aiChatService.chat(request.getMessage());
        return ResponseEntity.ok(ApiResponse.success(ChatResponse.builder().reply(reply).build()));
    }
}
