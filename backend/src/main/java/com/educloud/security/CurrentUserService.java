package com.educloud.security;

import com.educloud.entity.Admin;
import com.educloud.entity.Faculty;
import com.educloud.entity.Student;
import com.educloud.entity.User;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.AdminRepository;
import com.educloud.repository.FacultyRepository;
import com.educloud.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * The ONLY correct way for a controller/service to find out "who is asking".
 * Every method here derives identity from the Spring Security context (which
 * was populated from a verified, server-signed JWT) — never from a request
 * body/path parameter. This is what "never trust the user id/role from the
 * frontend" means in code, not just in a comment.
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AdminRepository adminRepository;

    public User getUser() {
        AppUserPrincipal principal = (AppUserPrincipal) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return principal.getUser();
    }

    public Long getUserId() {
        return getUser().getId();
    }

    public String getRole() {
        return getUser().getRole().name();
    }

    public Student getStudent() {
        return studentRepository.findByUser(getUser())
                .orElseThrow(() -> new NotFoundException("Student profile not found for the current account."));
    }

    public Faculty getFaculty() {
        return facultyRepository.findByUser(getUser())
                .orElseThrow(() -> new NotFoundException("Faculty profile not found for the current account."));
    }

    public Admin getAdmin() {
        return adminRepository.findByUser(getUser())
                .orElseThrow(() -> new NotFoundException("Admin profile not found for the current account."));
    }
}
