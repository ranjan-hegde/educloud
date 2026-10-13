package com.educloud.controller;

import com.educloud.dto.admin.SchoolClassResponse;
import com.educloud.dto.admin.StudentResponse;
import com.educloud.dto.admin.SubjectResponse;
import com.educloud.dto.common.ApiResponse;
import com.educloud.dto.profile.FacultyProfileResponse;
import com.educloud.dto.profile.UpdateFacultyProfileRequest;
import com.educloud.service.DashboardService;
import com.educloud.service.FacultyProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/faculty")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FACULTY')")
public class FacultyController {

    private final FacultyProfileService facultyProfileService;
    private final DashboardService dashboardService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<FacultyProfileResponse>> me() {
        return ResponseEntity.ok(ApiResponse.success(facultyProfileService.getMyProfile()));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<FacultyProfileResponse>> updateMe(@RequestBody UpdateFacultyProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.", facultyProfileService.updateMyProfile(request)));
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.facultyDashboard()));
    }

    @GetMapping("/me/subjects")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> subjects() {
        return ResponseEntity.ok(ApiResponse.success(facultyProfileService.getMySubjects()));
    }

    @GetMapping("/me/classes")
    public ResponseEntity<ApiResponse<List<SchoolClassResponse>>> classes() {
        return ResponseEntity.ok(ApiResponse.success(facultyProfileService.getMyClasses()));
    }

    @GetMapping("/me/students")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> students() {
        return ResponseEntity.ok(ApiResponse.success(facultyProfileService.getMyStudents()));
    }
}
