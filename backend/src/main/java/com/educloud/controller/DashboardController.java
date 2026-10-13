package com.educloud.controller;

import com.educloud.dto.common.ApiResponse;
import com.educloud.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> student() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.studentDashboard()));
    }

    @GetMapping("/faculty")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> faculty() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.facultyDashboard()));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> admin() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.adminDashboard()));
    }
}
