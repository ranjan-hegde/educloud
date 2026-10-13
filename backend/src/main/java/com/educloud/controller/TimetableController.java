package com.educloud.controller;

import com.educloud.dto.common.ApiResponse;
import com.educloud.dto.misc.TimetableRequest;
import com.educloud.dto.misc.TimetableResponse;
import com.educloud.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(timetableService.listAll()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> listForStudent() {
        return ResponseEntity.ok(ApiResponse.success(timetableService.listForCurrentStudent()));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> listForFaculty() {
        return ResponseEntity.ok(ApiResponse.success(timetableService.listForCurrentFaculty()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimetableResponse>> create(@Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Timetable entry added.", timetableService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TimetableResponse>> update(@PathVariable Long id, @Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Timetable entry updated.", timetableService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        timetableService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry deleted."));
    }
}
