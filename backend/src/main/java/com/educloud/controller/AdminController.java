package com.educloud.controller;

import com.educloud.dto.admin.*;
import com.educloud.dto.common.ApiResponse;
import com.educloud.service.AdminCatalogService;
import com.educloud.service.AdminUserService;
import com.educloud.service.DashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminUserService adminUserService;
    private final AdminCatalogService adminCatalogService;
    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.adminDashboard()));
    }

    // ---------------- Students ----------------

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> listStudents() {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.listStudents()));
    }

    @PostMapping("/students")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Student added successfully.", adminUserService.createStudent(request)));
    }

    @GetMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getStudent(id)));
    }

    @PutMapping("/students/{id}")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully.", adminUserService.updateStudent(id, request)));
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        adminUserService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully."));
    }

    // ---------------- Faculty ----------------

    @GetMapping("/faculty")
    public ResponseEntity<ApiResponse<List<FacultyResponse>>> listFaculty() {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.listFaculty()));
    }

    @PostMapping("/faculty")
    public ResponseEntity<ApiResponse<FacultyResponse>> createFaculty(@Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Faculty added successfully.", adminUserService.createFaculty(request)));
    }

    @GetMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<FacultyResponse>> getFaculty(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminUserService.getFaculty(id)));
    }

    @PutMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<FacultyResponse>> updateFaculty(@PathVariable Long id, @Valid @RequestBody FacultyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Faculty updated successfully.", adminUserService.updateFaculty(id, request)));
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFaculty(@PathVariable Long id) {
        adminUserService.deleteFaculty(id);
        return ResponseEntity.ok(ApiResponse.success("Faculty deleted successfully."));
    }

    // ---------------- Departments ----------------

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> listDepartments() {
        return ResponseEntity.ok(ApiResponse.success(adminCatalogService.listDepartments()));
    }

    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<DepartmentResponse>> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Department added.", adminCatalogService.createDepartment(request)));
    }

    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Department updated.", adminCatalogService.updateDepartment(id, request)));
    }

    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        adminCatalogService.deleteDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("Department deleted."));
    }

    // ---------------- Courses ----------------

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> listCourses() {
        return ResponseEntity.ok(ApiResponse.success(adminCatalogService.listCourses()));
    }

    @PostMapping("/courses")
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@Valid @RequestBody CourseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Course added.", adminCatalogService.createCourse(request)));
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Course updated.", adminCatalogService.updateCourse(id, request)));
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCourse(@PathVariable Long id) {
        adminCatalogService.deleteCourse(id);
        return ResponseEntity.ok(ApiResponse.success("Course deleted."));
    }

    // ---------------- Classes ----------------

    @GetMapping("/classes")
    public ResponseEntity<ApiResponse<List<SchoolClassResponse>>> listClasses() {
        return ResponseEntity.ok(ApiResponse.success(adminCatalogService.listClasses()));
    }

    @PostMapping("/classes")
    public ResponseEntity<ApiResponse<SchoolClassResponse>> createClass(@Valid @RequestBody SchoolClassRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Class added.", adminCatalogService.createClass(request)));
    }

    @DeleteMapping("/classes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteClass(@PathVariable Long id) {
        adminCatalogService.deleteClass(id);
        return ResponseEntity.ok(ApiResponse.success("Class deleted."));
    }

    // ---------------- Subjects ----------------

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<SubjectResponse>>> listSubjects() {
        return ResponseEntity.ok(ApiResponse.success(adminCatalogService.listSubjects()));
    }

    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse<SubjectResponse>> createSubject(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Subject added.", adminCatalogService.createSubject(request)));
    }

    @PutMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<SubjectResponse>> updateSubject(@PathVariable Long id, @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Subject updated.", adminCatalogService.updateSubject(id, request)));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        adminCatalogService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success("Subject deleted."));
    }

    // ---------------- Locations ----------------

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<LocationResponse>>> listLocations() {
        return ResponseEntity.ok(ApiResponse.success(adminCatalogService.listLocations()));
    }

    @PostMapping("/locations")
    public ResponseEntity<ApiResponse<LocationResponse>> createLocation(@Valid @RequestBody LocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Location added.", adminCatalogService.createLocation(request)));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<LocationResponse>> updateLocation(@PathVariable Long id, @Valid @RequestBody LocationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Location updated.", adminCatalogService.updateLocation(id, request)));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable Long id) {
        adminCatalogService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success("Location deleted."));
    }
}
