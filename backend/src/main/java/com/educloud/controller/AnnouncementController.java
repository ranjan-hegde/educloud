package com.educloud.controller;

import com.educloud.dto.common.ApiResponse;
import com.educloud.dto.misc.AnnouncementRequest;
import com.educloud.dto.misc.AnnouncementResponse;
import com.educloud.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> listAll() {
        return ResponseEntity.ok(ApiResponse.success(announcementService.listAll()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> create(@Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Announcement posted.", announcementService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> update(@PathVariable Long id, @Valid @RequestBody AnnouncementRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Announcement updated.", announcementService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement deleted."));
    }
}
