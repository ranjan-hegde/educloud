package com.educloud.service;

import com.educloud.dto.auth.*;
import com.educloud.entity.*;
import com.educloud.exception.BadRequestException;
import com.educloud.exception.ConflictException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.AppUserPrincipal;
import com.educloud.security.CurrentUserService;
import com.educloud.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AdminRepository adminRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final CurrentUserService currentUserService;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ConflictException("An account with this email already exists.");
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase(Locale.ROOT))
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(req.getRole())
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Long profileId;
        switch (req.getRole()) {
            case STUDENT -> {
                if (req.getDepartmentId() == null || req.getCourseId() == null || req.getSemester() == null) {
                    throw new BadRequestException("Department, course, and semester are required to register a student.");
                }
                Department dept = (req.getDepartmentId() != null ? departmentRepository.findById(req.getDepartmentId()).orElse(null) : null);
                if (dept == null) {
                    dept = departmentRepository.findAll().stream().findFirst().orElse(null);
                }
                Course course = (req.getCourseId() != null ? courseRepository.findById(req.getCourseId()).orElse(null) : null);
                if (course == null) {
                    course = courseRepository.findAll().stream().findFirst().orElse(null);
                }
                Student student = Student.builder()
                        .user(user)
                        .department(dept)
                        .course(course)
                        .semester(req.getSemester())
                        .status(Student.StudentStatus.ACTIVE)
                        .build();
                student = studentRepository.save(student);
                student.setRollNo("STU" + (2300 + student.getId()));
                studentRepository.save(student);
                profileId = student.getId();
            }
            case FACULTY -> {
                Department dept = req.getDepartmentId() != null
                        ? departmentRepository.findById(req.getDepartmentId()).orElseThrow(() -> new NotFoundException("Department not found."))
                        : null;
                if (dept == null) throw new BadRequestException("Department is required to register faculty.");
                Faculty faculty = Faculty.builder()
                        .user(user)
                        .department(dept)
                        .designation(req.getDesignation() != null ? req.getDesignation() : "Assistant Professor")
                        .status(Faculty.FacultyStatus.ACTIVE)
                        .build();
                faculty = facultyRepository.save(faculty);
                profileId = faculty.getId();
            }
            case ADMIN -> {
                Admin admin = Admin.builder().user(user).designation("Administrator").build();
                admin = adminRepository.save(admin);
                profileId = admin.getId();
            }
            default -> throw new BadRequestException("Unsupported role.");
        }

        emailService.sendRegistrationConfirmation(user.getEmail(), user.getName());

        String token = jwtService.generateToken(new AppUserPrincipal(user), user.getId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .user(toSummary(user, profileId))
                .build();
    }

    public AuthResponse login(LoginRequest req) {
        // AuthenticationManager throws BadCredentialsException on mismatch — handled by GlobalExceptionHandler.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail().toLowerCase(Locale.ROOT), req.getPassword()));

        User user = userRepository.findByEmailIgnoreCase(req.getEmail())
                .orElseThrow(() -> new NotFoundException("Account not found."));

        Long profileId = resolveProfileId(user);
        String token = jwtService.generateToken(new AppUserPrincipal(user), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .user(toSummary(user, profileId))
                .build();
    }

    @Transactional
    public AuthResponse googleLogin(GoogleAuthRequest req) {
        String email = req.getEmail().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);

        Role role = req.getRole() != null ? req.getRole() : Role.STUDENT;

        if (user == null) {
            user = User.builder()
                    .name(req.getName())
                    .email(email)
                    .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(role)
                    .enabled(true)
                    .build();
            user = userRepository.save(user);

            Long profileId;
            switch (role) {
                case STUDENT -> {
                    Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);
                    Course course = courseRepository.findAll().stream().findFirst().orElse(null);
                    Student student = Student.builder()
                            .user(user)
                            .department(dept)
                            .course(course)
                            .semester(1)
                            .status(Student.StudentStatus.ACTIVE)
                            .academicYear("2026-2027")
                            .build();
                    student = studentRepository.save(student);
                    student.setRollNo("STU" + (2500 + student.getId()));
                    student = studentRepository.save(student);
                    profileId = student.getId();
                }
                case FACULTY -> {
                    Department dept = departmentRepository.findAll().stream().findFirst().orElse(null);
                    Faculty faculty = Faculty.builder()
                            .user(user)
                            .department(dept)
                            .designation("Assistant Professor")
                            .status(Faculty.FacultyStatus.ACTIVE)
                            .build();
                    faculty = facultyRepository.save(faculty);
                    profileId = faculty.getId();
                }
                case ADMIN -> {
                    Admin admin = Admin.builder().user(user).designation("Administrator").build();
                    admin = adminRepository.save(admin);
                    profileId = admin.getId();
                }
                default -> throw new BadRequestException("Unsupported role.");
            }

            String token = jwtService.generateToken(new AppUserPrincipal(user), user.getId(), user.getRole().name());
            return AuthResponse.builder()
                    .token(token)
                    .user(toSummary(user, profileId))
                    .build();
        }

        Long profileId = resolveProfileId(user);
        String token = jwtService.generateToken(new AppUserPrincipal(user), user.getId(), user.getRole().name());
        return AuthResponse.builder()
                .token(token)
                .user(toSummary(user, profileId))
                .build();
    }

    /** Stateless JWT — there's nothing server-side to invalidate; the client simply discards the token. */
    public void logout() {
        // No-op by design. If a token-blacklist/refresh-token store is added later, revoke here.
    }

    public UserSummary me() {
        User user = currentUserService.getUser();
        return toSummary(user, resolveProfileId(user));
    }

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmailIgnoreCase(email).ifPresent(user -> {
            String token = com.educloud.util.TokenGenerator.resetToken();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(LocalDateTime.now().plusMinutes(30))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        });
        // Always behave the same way whether or not the email exists, to avoid leaking which emails are registered.
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset link."));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Invalid or expired reset link.");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private Long resolveProfileId(User user) {
        return switch (user.getRole()) {
            case STUDENT -> studentRepository.findByUser(user).map(Student::getId).orElse(null);
            case FACULTY -> facultyRepository.findByUser(user).map(Faculty::getId).orElse(null);
            case ADMIN -> adminRepository.findByUser(user).map(Admin::getId).orElse(null);
        };
    }

    private UserSummary toSummary(User user, Long profileId) {
        return UserSummary.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name().toLowerCase(Locale.ROOT))
                .profileId(profileId)
                .build();
    }
}
