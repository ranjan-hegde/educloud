package com.educloud.controller;

import com.educloud.dto.attendance.*;
import com.educloud.dto.common.ApiResponse;
import com.educloud.service.QrAttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/qr-attendance")
@RequiredArgsConstructor
public class QrAttendanceController {

    private final QrAttendanceService qrAttendanceService;

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance session created.", qrAttendanceService.createSession(request)));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> listSessions(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        List<SessionResponse> sessions = all
                ? qrAttendanceService.listAllSessions()
                : qrAttendanceService.listSessionsForCurrentFaculty();
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(qrAttendanceService.getSession(id)));
    }

    @PostMapping("/sessions/{id}/close")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<SessionResponse>> closeSession(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Session closed.", qrAttendanceService.closeSession(id)));
    }

    @PostMapping("/mark")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> markAttendance(@Valid @RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully.", qrAttendanceService.markAttendance(request)));
    }

    @GetMapping("/student/history")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> studentHistory() {
        return ResponseEntity.ok(ApiResponse.success(qrAttendanceService.getStudentHistory()));
    }

    @GetMapping("/sessions/{id}/records")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> sessionRecords(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(qrAttendanceService.getSessionRecords(id)));
    }
}
