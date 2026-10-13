package com.educloud.controller;

import com.educloud.dto.academic.*;
import com.educloud.dto.common.ApiResponse;
import com.educloud.service.AssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.listAll()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> listForStudent() {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.listForCurrentStudent()));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> create(@Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Assignment created.", assignmentService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<AssignmentResponse>> update(@PathVariable Long id, @Valid @RequestBody AssignmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Assignment updated.", assignmentService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        assignmentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Assignment deleted."));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> submit(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Assignment submitted.", assignmentService.submit(id, file)));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<List<SubmissionResponse>>> submissions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.getSubmissions(id)));
    }

    @PutMapping("/submissions/{id}/grade")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<SubmissionResponse>> grade(@PathVariable Long id, @Valid @RequestBody GradeSubmissionRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Submission graded.", assignmentService.gradeSubmission(id, request)));
    }
}
