package com.educloud.service;

import com.educloud.dto.admin.*;
import com.educloud.entity.*;
import com.educloud.exception.BadRequestException;
import com.educloud.exception.ConflictException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** Backs Admin management of Students and Faculty, including their linked User accounts. */
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;
    private final ClassStudentRepository classStudentRepository;
    private final AdminCatalogService adminCatalogService;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ---------------- Students ----------------

    public List<StudentResponse> listStudents() {
        return studentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public StudentResponse getStudent(Long id) {
        return toResponse(studentRepository.findById(id).orElseThrow(() -> new NotFoundException("Student not found.")));
    }

    @Transactional
    public StudentResponse createStudent(StudentRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ConflictException("An account with this email already exists.");
        }
        Department dept = departmentRepository.findById(req.getDepartmentId()).orElseThrow(() -> new NotFoundException("Department not found."));
        Course course = courseRepository.findById(req.getCourseId()).orElseThrow(() -> new NotFoundException("Course not found."));

        String rawPassword = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword()
                : "Student@" + UUID.randomUUID().toString().substring(0, 6);

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase(Locale.ROOT))
                .passwordHash(passwordEncoder.encode(rawPassword))
                .phone(req.getPhone())
                .role(Role.STUDENT)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Student student = Student.builder()
                .user(user)
                .department(dept)
                .course(course)
                .semester(req.getSemester())
                .status(req.getStatus() != null ? Student.StudentStatus.valueOf(req.getStatus().toUpperCase(Locale.ROOT)) : Student.StudentStatus.ACTIVE)
                .build();
        student = studentRepository.save(student);
        student.setRollNo("STU" + (2300 + student.getId()));
        student = studentRepository.save(student);

        SchoolClass schoolClass = adminCatalogService.getOrCreateDefaultClass(course, req.getSemester());
        classStudentRepository.save(ClassStudent.builder().student(student).schoolClass(schoolClass).build());

        emailService.sendRegistrationConfirmation(user.getEmail(), user.getName());

        return toResponse(student);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, StudentRequest req) {
        Student student = studentRepository.findById(id).orElseThrow(() -> new NotFoundException("Student not found."));
        Department dept = departmentRepository.findById(req.getDepartmentId()).orElseThrow(() -> new NotFoundException("Department not found."));
        Course course = courseRepository.findById(req.getCourseId()).orElseThrow(() -> new NotFoundException("Course not found."));

        User user = student.getUser();
        user.setName(req.getName());
        user.setPhone(req.getPhone());
        userRepository.save(user);

        boolean classChanged = !student.getCourse().getId().equals(course.getId()) || !student.getSemester().equals(req.getSemester());

        student.setDepartment(dept);
        student.setCourse(course);
        student.setSemester(req.getSemester());
        if (req.getStatus() != null) student.setStatus(Student.StudentStatus.valueOf(req.getStatus().toUpperCase(Locale.ROOT)));
        student = studentRepository.save(student);

        if (classChanged) {
            classStudentRepository.findByStudent(student).ifPresent(classStudentRepository::delete);
            SchoolClass schoolClass = adminCatalogService.getOrCreateDefaultClass(course, req.getSemester());
            classStudentRepository.save(ClassStudent.builder().student(student).schoolClass(schoolClass).build());
        }

        return toResponse(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id).orElseThrow(() -> new NotFoundException("Student not found."));
        classStudentRepository.findByStudent(student).ifPresent(classStudentRepository::delete);
        studentRepository.delete(student);
        userRepository.delete(student.getUser());
    }

    private StudentResponse toResponse(Student s) {
        List<Attendance> records = attendanceRepository.findByStudent(s);
        int total = records.size();
        int present = (int) records.stream().filter(a -> a.getStatus() != AttendanceStatus.ABSENT).count();
        Integer pct = total == 0 ? null : Math.round(present * 100f / total);
        return StudentResponse.builder()
                .id(s.getId()).rollNo(s.getRollNo()).name(s.getUser().getName()).email(s.getUser().getEmail())
                .phone(s.getUser().getPhone()).department(s.getDepartment().getName()).course(s.getCourse().getName())
                .semester(s.getSemester()).status(s.getStatus().name()).attendance(pct).build();
    }

    // ---------------- Faculty ----------------

    public List<FacultyResponse> listFaculty() {
        return facultyRepository.findAll().stream().map(this::toResponse).toList();
    }

    public FacultyResponse getFaculty(Long id) {
        return toResponse(facultyRepository.findById(id).orElseThrow(() -> new NotFoundException("Faculty not found.")));
    }

    @Transactional
    public FacultyResponse createFaculty(FacultyRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ConflictException("An account with this email already exists.");
        }
        Department dept = departmentRepository.findById(req.getDepartmentId()).orElseThrow(() -> new NotFoundException("Department not found."));

        String rawPassword = req.getPassword() != null && !req.getPassword().isBlank()
                ? req.getPassword()
                : "Faculty@" + UUID.randomUUID().toString().substring(0, 6);

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail().toLowerCase(Locale.ROOT))
                .passwordHash(passwordEncoder.encode(rawPassword))
                .phone(req.getPhone())
                .role(Role.FACULTY)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        Faculty faculty = Faculty.builder()
                .user(user)
                .department(dept)
                .designation(req.getDesignation())
                .status(req.getStatus() != null ? Faculty.FacultyStatus.valueOf(req.getStatus().toUpperCase(Locale.ROOT)) : Faculty.FacultyStatus.ACTIVE)
                .build();
        faculty = facultyRepository.save(faculty);

        assignSubjects(faculty, req.getSubjectIds());
        emailService.sendRegistrationConfirmation(user.getEmail(), user.getName());

        return toResponse(faculty);
    }

    @Transactional
    public FacultyResponse updateFaculty(Long id, FacultyRequest req) {
        Faculty faculty = facultyRepository.findById(id).orElseThrow(() -> new NotFoundException("Faculty not found."));
        Department dept = departmentRepository.findById(req.getDepartmentId()).orElseThrow(() -> new NotFoundException("Department not found."));

        User user = faculty.getUser();
        user.setName(req.getName());
        user.setPhone(req.getPhone());
        userRepository.save(user);

        faculty.setDepartment(dept);
        faculty.setDesignation(req.getDesignation());
        if (req.getStatus() != null) faculty.setStatus(Faculty.FacultyStatus.valueOf(req.getStatus().toUpperCase(Locale.ROOT)));
        faculty = facultyRepository.save(faculty);

        if (req.getSubjectIds() != null) {
            // Replace existing assignments with the newly-selected set.
            assignmentRepository.findByFaculty(faculty).forEach(assignmentRepository::delete);
            assignSubjects(faculty, req.getSubjectIds());
        }

        return toResponse(faculty);
    }

    private void assignSubjects(Faculty faculty, List<Long> subjectIds) {
        if (subjectIds == null) return;
        for (Long subjectId : subjectIds) {
            Subject subject = subjectRepository.findById(subjectId)
                    .orElseThrow(() -> new BadRequestException("Subject not found: " + subjectId));
            SchoolClass schoolClass = adminCatalogService.getOrCreateDefaultClass(subject.getCourse(), subject.getSemester());
            boolean exists = assignmentRepository.findByFacultyAndSubjectAndSchoolClass(faculty, subject, schoolClass).isPresent();
            if (!exists) {
                assignmentRepository.save(FacultySubjectAssignment.builder()
                        .faculty(faculty).subject(subject).schoolClass(schoolClass).build());
            }
        }
    }

    @Transactional
    public void deleteFaculty(Long id) {
        Faculty faculty = facultyRepository.findById(id).orElseThrow(() -> new NotFoundException("Faculty not found."));
        assignmentRepository.findByFaculty(faculty).forEach(assignmentRepository::delete);
        facultyRepository.delete(faculty);
        userRepository.delete(faculty.getUser());
    }

    private FacultyResponse toResponse(Faculty f) {
        List<String> subjectNames = assignmentRepository.findByFaculty(f).stream()
                .map(a -> a.getSubject().getName()).distinct().toList();
        return FacultyResponse.builder()
                .id(f.getId()).name(f.getUser().getName()).email(f.getUser().getEmail()).phone(f.getUser().getPhone())
                .department(f.getDepartment().getName()).designation(f.getDesignation()).status(f.getStatus().name())
                .subjects(subjectNames).build();
    }
}
