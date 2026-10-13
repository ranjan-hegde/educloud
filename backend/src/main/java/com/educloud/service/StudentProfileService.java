package com.educloud.service;

import com.educloud.dto.profile.StudentProfileResponse;
import com.educloud.dto.profile.UpdateStudentProfileRequest;
import com.educloud.entity.Student;
import com.educloud.entity.User;
import com.educloud.repository.StudentRepository;
import com.educloud.repository.UserRepository;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public StudentProfileResponse getMyProfile() {
        return toResponse(currentUserService.getStudent());
    }

    @Transactional
    public StudentProfileResponse updateMyProfile(UpdateStudentProfileRequest req) {
        Student student = currentUserService.getStudent();
        User user = student.getUser();
        if (req.getName() != null && !req.getName().isBlank()) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        userRepository.save(user);

        if (req.getAddress() != null) student.setAddress(req.getAddress());
        if (req.getDob() != null) student.setDob(req.getDob());
        if (req.getBloodGroup() != null) student.setBloodGroup(req.getBloodGroup());
        if (req.getGuardianName() != null) student.setGuardianName(req.getGuardianName());
        if (req.getGuardianPhone() != null) student.setGuardianPhone(req.getGuardianPhone());
        student = studentRepository.save(student);

        return toResponse(student);
    }

    private StudentProfileResponse toResponse(Student s) {
        return StudentProfileResponse.builder()
                .id(s.getId()).rollNo(s.getRollNo()).name(s.getUser().getName()).email(s.getUser().getEmail())
                .phone(s.getUser().getPhone()).department(s.getDepartment().getName()).course(s.getCourse().getName())
                .semester(s.getSemester()).status(s.getStatus().name()).address(s.getAddress()).dob(s.getDob())
                .bloodGroup(s.getBloodGroup()).guardianName(s.getGuardianName()).guardianPhone(s.getGuardianPhone())
                .build();
    }
}
