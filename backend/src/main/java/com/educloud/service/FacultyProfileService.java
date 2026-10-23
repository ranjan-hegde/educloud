package com.educloud.service;

import com.educloud.dto.admin.SchoolClassResponse;
import com.educloud.dto.admin.StudentResponse;
import com.educloud.dto.admin.SubjectResponse;
import com.educloud.dto.profile.FacultyProfileResponse;
import com.educloud.dto.profile.UpdateFacultyProfileRequest;
import com.educloud.entity.*;
import com.educloud.repository.AttendanceRepository;
import com.educloud.repository.ClassStudentRepository;
import com.educloud.repository.FacultyRepository;
import com.educloud.repository.FacultySubjectAssignmentRepository;
import com.educloud.repository.UserRepository;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacultyProfileService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final ClassStudentRepository classStudentRepository;
    private final AttendanceRepository attendanceRepository;
    private final CurrentUserService currentUserService;

    public FacultyProfileResponse getMyProfile() {
        return toResponse(currentUserService.getFaculty());
    }

    @Transactional
    public FacultyProfileResponse updateMyProfile(UpdateFacultyProfileRequest req) {
        Faculty faculty = currentUserService.getFaculty();
        User user = faculty.getUser();
        if (req.getName() != null && !req.getName().isBlank()) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        userRepository.save(user);

        if (req.getQualification() != null) faculty.setQualification(req.getQualification());
        if (req.getExperience() != null) faculty.setExperience(req.getExperience());
        faculty = facultyRepository.save(faculty);

        return toResponse(faculty);
    }

    public List<SubjectResponse> getMySubjects() {
        Faculty faculty = currentUserService.getFaculty();
        return assignmentRepository.findByFaculty(faculty).stream().map(a -> {
            Subject s = a.getSubject();
            return SubjectResponse.builder()
                    .id(s.getId()).name(s.getName()).code(s.getCode()).course(s.getCourse().getName())
                    .courseId(s.getCourse().getId()).semester(s.getSemester()).credits(s.getCredits())
                    .faculty(faculty.getUser().getName()).build();
        }).distinct().toList();
    }

    public List<SchoolClassResponse> getMyClasses() {
        Faculty faculty = currentUserService.getFaculty();
        return assignmentRepository.findByFaculty(faculty).stream()
                .map(FacultySubjectAssignment::getSchoolClass).distinct()
                .map(c -> SchoolClassResponse.builder()
                        .id(c.getId()).name(c.getDisplayName()).course(c.getCourse().getName())
                        .courseId(c.getCourse().getId()).semester(c.getSemester()).section(c.getSection())
                        .studentCount(classStudentRepository.findBySchoolClass(c).size())
                        .build())
                .toList();
    }

    public List<StudentResponse> getMyStudents() {
        Faculty faculty = currentUserService.getFaculty();
        List<SchoolClass> myClasses = assignmentRepository.findByFaculty(faculty).stream()
                .map(FacultySubjectAssignment::getSchoolClass).distinct().toList();
        List<Student> students = myClasses.stream()
                .flatMap(c -> classStudentRepository.findBySchoolClass(c).stream())
                .map(ClassStudent::getStudent)
                .distinct().toList();

        if (students.isEmpty()) {
            students = studentRepository.findAll();
        }

        return students.stream()
                .map(s -> {
                    List<Attendance> records = attendanceRepository.findByStudent(s);
                    int total = records.size();
                    int present = (int) records.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
                    Integer pct = total == 0 ? null : Math.round(present * 100f / total);
                    return StudentResponse.builder()
                            .id(s.getId()).rollNo(s.getRollNo()).name(s.getUser().getName()).email(s.getUser().getEmail())
                            .phone(s.getUser().getPhone()).department(s.getDepartment().getName()).course(s.getCourse().getName())
                            .semester(s.getSemester()).status(s.getStatus().name()).attendance(pct).build();
                })
                .toList();
    }

    private FacultyProfileResponse toResponse(Faculty f) {
        return FacultyProfileResponse.builder()
                .id(f.getId()).name(f.getUser().getName()).email(f.getUser().getEmail()).phone(f.getUser().getPhone())
                .department(f.getDepartment().getName()).designation(f.getDesignation())
                .qualification(f.getQualification()).experience(f.getExperience()).status(f.getStatus().name())
                .subjects(assignmentRepository.findByFaculty(f).stream().map(a -> a.getSubject().getName()).distinct().toList())
                .build();
    }
}

