package com.educloud.controller;

import com.educloud.dto.academic.AssessmentResponse;
import com.educloud.dto.academic.AssignmentResponse;
import com.educloud.dto.academic.MarksResponse;
import com.educloud.dto.attendance.AttendanceRecordResponse;
import com.educloud.dto.common.ApiResponse;
import com.educloud.dto.fees.FeeResponse;
import com.educloud.dto.misc.MaterialResponse;
import com.educloud.dto.misc.TimetableResponse;
import com.educloud.dto.profile.StudentProfileResponse;
import com.educloud.dto.profile.UpdateStudentProfileRequest;
import com.educloud.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentController {

    private final StudentProfileService studentProfileService;
    private final DashboardService dashboardService;
    private final AttendanceService attendanceService;
    private final MarksService marksService;
    private final AssessmentService assessmentService;
    private final AssignmentService assignmentService;
    private final TimetableService timetableService;
    private final CourseMaterialService courseMaterialService;
    private final FeeService feeService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> me() {
        return ResponseEntity.ok(ApiResponse.success(studentProfileService.getMyProfile()));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateMe(@RequestBody UpdateStudentProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully.", studentProfileService.updateMyProfile(request)));
    }

    @GetMapping("/me/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.studentDashboard()));
    }

    @GetMapping("/me/attendance")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> attendance() {
        return ResponseEntity.ok(ApiResponse.success(attendanceService.getStudentAttendance()));
    }

    @GetMapping("/me/marks")
    public ResponseEntity<ApiResponse<List<MarksResponse>>> marks() {
        return ResponseEntity.ok(ApiResponse.success(marksService.getStudentMarks()));
    }

    @GetMapping("/me/assessments")
    public ResponseEntity<ApiResponse<List<AssessmentResponse>>> assessments() {
        return ResponseEntity.ok(ApiResponse.success(assessmentService.listForCurrentStudent()));
    }

    @GetMapping("/me/assignments")
    public ResponseEntity<ApiResponse<List<AssignmentResponse>>> assignments() {
        return ResponseEntity.ok(ApiResponse.success(assignmentService.listForCurrentStudent()));
    }

    @GetMapping("/me/timetable")
    public ResponseEntity<ApiResponse<List<TimetableResponse>>> timetable() {
        return ResponseEntity.ok(ApiResponse.success(timetableService.listForCurrentStudent()));
    }

    @GetMapping("/me/materials")
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> materials() {
        return ResponseEntity.ok(ApiResponse.success(courseMaterialService.listForCurrentStudent()));
    }

    @GetMapping("/me/fees")
    public ResponseEntity<ApiResponse<List<FeeResponse>>> fees() {
        return ResponseEntity.ok(ApiResponse.success(feeService.getStudentFees()));
    }
}
