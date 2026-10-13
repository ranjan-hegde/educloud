package com.educloud.controller;

import com.educloud.dto.attendance.*;
import com.educloud.dto.common.ApiResponse;
import com.educloud.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> studentAttendance() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentAttendance()));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('FACULTY','ADMIN')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> classAttendance(
            @PathVariable Long classId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getClassAttendance(classId, date)));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> manualAttendance(@Valid @RequestBody ManualAttendanceRequest request) {
        attendanceService.markManualAttendance(request);
        return ResponseEntity.ok(ApiResponse.success("Attendance saved successfully."));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> update(
            @PathVariable Long id, @Valid @RequestBody UpdateAttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Attendance updated.", attendanceService.updateAttendance(id, request)));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceSummaryResponse>> summary() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getSummary()));
    }

    @GetMapping("/subject-wise")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<SubjectAttendanceResponse>>> subjectWise() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getSubjectWise()));
    }

    @GetMapping("/trend")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<TrendPoint>>> trend() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getTrend()));
    }
}
