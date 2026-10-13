package com.educloud.controller;

import com.educloud.dto.academic.AssessmentRequest;
import com.educloud.dto.academic.AssessmentResponse;
import com.educloud.dto.common.ApiResponse;
import com.educloud.service.AssessmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssessmentResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(assessmentService.listAll()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AssessmentResponse>>> listForStudent() {
        return ResponseEntity.ok(ApiResponse.success(assessmentService.listForCurrentStudent()));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<AssessmentResponse>> create(@Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Assessment created.", assessmentService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<AssessmentResponse>> update(@PathVariable Long id, @Valid @RequestBody AssessmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Assessment updated.", assessmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        assessmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Assessment deleted."));
    }
}
