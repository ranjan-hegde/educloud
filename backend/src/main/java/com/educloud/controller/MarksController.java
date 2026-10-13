package com.educloud.controller;

import com.educloud.dto.academic.MarksRequest;
import com.educloud.dto.academic.MarksResponse;
import com.educloud.dto.common.ApiResponse;
import com.educloud.service.MarksService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@RequiredArgsConstructor
public class MarksController {

    private final MarksService marksService;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<MarksResponse>>> studentMarks() {
        return ResponseEntity.ok(ApiResponse.success(marksService.getStudentMarks()));
    }

    @GetMapping("/subject/{subjectId}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<List<MarksResponse>>> subjectMarks(@PathVariable Long subjectId) {
        return ResponseEntity.ok(ApiResponse.success(marksService.getSubjectMarks(subjectId)));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<MarksResponse>> create(@Valid @RequestBody MarksRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Marks saved.", marksService.saveMarks(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<MarksResponse>> update(@PathVariable Long id, @Valid @RequestBody MarksRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Marks updated.", marksService.updateMarks(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        marksService.deleteMarks(id);
        return ResponseEntity.ok(ApiResponse.success("Marks record deleted."));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Object>> summary() {
        return ResponseEntity.ok(ApiResponse.success(marksService.getSummary()));
    }
}
