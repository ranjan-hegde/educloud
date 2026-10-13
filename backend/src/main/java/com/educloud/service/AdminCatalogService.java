package com.educloud.service;

import com.educloud.dto.admin.*;
import com.educloud.entity.*;
import com.educloud.exception.ConflictException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Backs Admin management of Departments, Courses, Classes, Subjects, and Locations. */
@Service
@RequiredArgsConstructor
public class AdminCatalogService {

    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final LocationRepository locationRepository;
    private final FacultyRepository facultyRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final ClassStudentRepository classStudentRepository;

    // ---------------- Departments ----------------

    public List<DepartmentResponse> listDepartments() {
        return departmentRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public DepartmentResponse createDepartment(DepartmentRequest req) {
        if (departmentRepository.existsByNameIgnoreCase(req.getName())) {
            throw new ConflictException("A department with this name already exists.");
        }
        Department dept = Department.builder().name(req.getName()).headName(req.getHeadName()).build();
        return toResponse(departmentRepository.save(dept));
    }

    @Transactional
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest req) {
        Department dept = departmentRepository.findById(id).orElseThrow(() -> new NotFoundException("Department not found."));
        dept.setName(req.getName());
        dept.setHeadName(req.getHeadName());
        return toResponse(departmentRepository.save(dept));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) throw new NotFoundException("Department not found.");
        departmentRepository.deleteById(id);
    }

    private DepartmentResponse toResponse(Department d) {
        long facultyCount = facultyRepository.findAll().stream().filter(f -> f.getDepartment().getId().equals(d.getId())).count();
        long studentCount = studentRepository.findAll().stream().filter(s -> s.getDepartment().getId().equals(d.getId())).count();
        return DepartmentResponse.builder().id(d.getId()).name(d.getName()).headName(d.getHeadName())
                .facultyCount(facultyCount).studentCount(studentCount).build();
    }

    // ---------------- Courses ----------------

    public List<CourseResponse> listCourses() {
        return courseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public CourseResponse createCourse(CourseRequest req) {
        Department dept = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found."));
        Course course = Course.builder().name(req.getName()).department(dept).duration(req.getDuration()).build();
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public CourseResponse updateCourse(Long id, CourseRequest req) {
        Course course = courseRepository.findById(id).orElseThrow(() -> new NotFoundException("Course not found."));
        Department dept = departmentRepository.findById(req.getDepartmentId())
                .orElseThrow(() -> new NotFoundException("Department not found."));
        course.setName(req.getName());
        course.setDepartment(dept);
        course.setDuration(req.getDuration());
        return toResponse(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) throw new NotFoundException("Course not found.");
        courseRepository.deleteById(id);
    }

    private CourseResponse toResponse(Course c) {
        long studentCount = studentRepository.findAll().stream().filter(s -> s.getCourse().getId().equals(c.getId())).count();
        return CourseResponse.builder().id(c.getId()).name(c.getName()).department(c.getDepartment().getName())
                .departmentId(c.getDepartment().getId()).duration(c.getDuration()).studentCount(studentCount).build();
    }

    // ---------------- Classes ----------------

    public List<SchoolClassResponse> listClasses() {
        return schoolClassRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public SchoolClassResponse createClass(SchoolClassRequest req) {
        Course course = courseRepository.findById(req.getCourseId()).orElseThrow(() -> new NotFoundException("Course not found."));
        String section = req.getSection() != null && !req.getSection().isBlank() ? req.getSection() : "A";
        schoolClassRepository.findByCourseAndSemesterAndSection(course, req.getSemester(), section).ifPresent(c -> {
            throw new ConflictException("This class already exists.");
        });
        SchoolClass schoolClass = SchoolClass.builder().course(course).semester(req.getSemester()).section(section).build();
        return toResponse(schoolClassRepository.save(schoolClass));
    }

    @Transactional
    public void deleteClass(Long id) {
        if (!schoolClassRepository.existsById(id)) throw new NotFoundException("Class not found.");
        schoolClassRepository.deleteById(id);
    }

    /** Finds the (course, semester, section "A") class, creating it if it doesn't exist yet. */
    @Transactional
    public SchoolClass getOrCreateDefaultClass(Course course, Integer semester) {
        return schoolClassRepository.findByCourseAndSemesterAndSection(course, semester, "A")
                .orElseGet(() -> schoolClassRepository.save(SchoolClass.builder().course(course).semester(semester).section("A").build()));
    }

    private SchoolClassResponse toResponse(SchoolClass c) {
        long studentCount = classStudentRepository.findBySchoolClass(c).size();
        return SchoolClassResponse.builder().id(c.getId()).name(c.getDisplayName()).course(c.getCourse().getName())
                .courseId(c.getCourse().getId()).semester(c.getSemester()).section(c.getSection()).studentCount(studentCount).build();
    }

    // ---------------- Subjects ----------------

    public List<SubjectResponse> listSubjects() {
        return subjectRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public SubjectResponse createSubject(SubjectRequest req) {
        Course course = courseRepository.findById(req.getCourseId()).orElseThrow(() -> new NotFoundException("Course not found."));
        Subject subject = Subject.builder().name(req.getName()).code(req.getCode()).course(course)
                .semester(req.getSemester()).credits(req.getCredits()).build();
        subject = subjectRepository.save(subject);
        if (req.getFacultyId() != null) {
            assignFaculty(subject, req.getFacultyId());
        }
        return toResponse(subject);
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, SubjectRequest req) {
        Subject subject = subjectRepository.findById(id).orElseThrow(() -> new NotFoundException("Subject not found."));
        Course course = courseRepository.findById(req.getCourseId()).orElseThrow(() -> new NotFoundException("Course not found."));
        subject.setName(req.getName());
        subject.setCode(req.getCode());
        subject.setCourse(course);
        subject.setSemester(req.getSemester());
        subject.setCredits(req.getCredits());
        subject = subjectRepository.save(subject);
        if (req.getFacultyId() != null) {
            assignFaculty(subject, req.getFacultyId());
        }
        return toResponse(subject);
    }

    private void assignFaculty(Subject subject, Long facultyId) {
        Faculty faculty = facultyRepository.findById(facultyId).orElseThrow(() -> new NotFoundException("Faculty not found."));
        SchoolClass schoolClass = getOrCreateDefaultClass(subject.getCourse(), subject.getSemester());
        boolean exists = assignmentRepository.findByFacultyAndSubjectAndSchoolClass(faculty, subject, schoolClass).isPresent();
        if (!exists) {
            assignmentRepository.save(FacultySubjectAssignment.builder()
                    .faculty(faculty).subject(subject).schoolClass(schoolClass).build());
        }
    }

    @Transactional
    public void deleteSubject(Long id) {
        if (!subjectRepository.existsById(id)) throw new NotFoundException("Subject not found.");
        subjectRepository.deleteById(id);
    }

    private SubjectResponse toResponse(Subject s) {
        SchoolClass schoolClass = schoolClassRepository.findByCourseAndSemesterAndSection(s.getCourse(), s.getSemester(), "A").orElse(null);
        String facultyName = "Unassigned";
        if (schoolClass != null) {
            List<FacultySubjectAssignment> assignments = assignmentRepository.findBySubjectAndSchoolClass(s, schoolClass);
            if (!assignments.isEmpty()) facultyName = assignments.get(0).getFaculty().getUser().getName();
        }
        return SubjectResponse.builder().id(s.getId()).name(s.getName()).code(s.getCode())
                .course(s.getCourse().getName()).courseId(s.getCourse().getId()).semester(s.getSemester())
                .credits(s.getCredits()).faculty(facultyName).build();
    }

    // ---------------- Locations ----------------

    public List<LocationResponse> listLocations() {
        return locationRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public LocationResponse createLocation(LocationRequest req) {
        Location location = Location.builder().name(req.getName()).room(req.getRoom())
                .latitude(req.getLatitude()).longitude(req.getLongitude())
                .radiusMeters(req.getRadiusMeters() != null ? req.getRadiusMeters() : 50)
                .build();
        return toResponse(locationRepository.save(location));
    }

    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest req) {
        Location location = locationRepository.findById(id).orElseThrow(() -> new NotFoundException("Location not found."));
        location.setName(req.getName());
        location.setRoom(req.getRoom());
        location.setLatitude(req.getLatitude());
        location.setLongitude(req.getLongitude());
        if (req.getRadiusMeters() != null) location.setRadiusMeters(req.getRadiusMeters());
        return toResponse(locationRepository.save(location));
    }

    @Transactional
    public void deleteLocation(Long id) {
        if (!locationRepository.existsById(id)) throw new NotFoundException("Location not found.");
        locationRepository.deleteById(id);
    }

    private LocationResponse toResponse(Location l) {
        return LocationResponse.builder().id(l.getId()).name(l.getName()).room(l.getRoom())
                .latitude(l.getLatitude()).longitude(l.getLongitude()).radiusMeters(l.getRadiusMeters()).build();
    }
}
