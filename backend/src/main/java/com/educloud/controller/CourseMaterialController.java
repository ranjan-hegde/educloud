package com.educloud.controller;

import com.educloud.dto.common.ApiResponse;
import com.educloud.dto.misc.MaterialRequest;
import com.educloud.dto.misc.MaterialResponse;
import com.educloud.service.CourseMaterialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
public class CourseMaterialController {

    private final CourseMaterialService materialService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(materialService.listAll()));
    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<MaterialResponse>>> listForStudent() {
        return ResponseEntity.ok(ApiResponse.success(materialService.listForCurrentStudent()));
    }

    @PostMapping
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<MaterialResponse>> create(
            @Valid @RequestPart("data") MaterialRequest request,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Material added.", materialService.create(request, file)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<MaterialResponse>> update(@PathVariable Long id, @Valid @RequestBody MaterialRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Material updated.", materialService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('FACULTY')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        materialService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Material deleted."));
    }
}
