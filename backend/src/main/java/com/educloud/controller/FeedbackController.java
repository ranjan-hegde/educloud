package com.educloud.controller;

import com.educloud.dto.common.ApiResponse;
import com.educloud.dto.misc.FeedbackReplyRequest;
import com.educloud.dto.misc.FeedbackRequest;
import com.educloud.dto.misc.FeedbackResponse;
import com.educloud.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeedbackResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.success(feedbackService.listForCurrentUser()));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> create(@Valid @RequestBody FeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Feedback submitted.", feedbackService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> reply(@PathVariable Long id, @Valid @RequestBody FeedbackReplyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Reply saved.", feedbackService.reply(id, request.getReply())));
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<FeedbackResponse>> replyPost(@PathVariable Long id, @Valid @RequestBody FeedbackReplyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Reply sent.", feedbackService.reply(id, request.getReply())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STUDENT')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        feedbackService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Feedback deleted."));
    }
}
