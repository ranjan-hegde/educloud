package com.educloud.repository;

import com.educloud.entity.Faculty;
import com.educloud.entity.FacultySubjectAssignment;
import com.educloud.entity.SchoolClass;
import com.educloud.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FacultySubjectAssignmentRepository extends JpaRepository<FacultySubjectAssignment, Long> {
    List<FacultySubjectAssignment> findByFaculty(Faculty faculty);
    Optional<FacultySubjectAssignment> findByFacultyAndSubjectAndSchoolClass(Faculty faculty, Subject subject, SchoolClass schoolClass);
    List<FacultySubjectAssignment> findBySubjectAndSchoolClass(Subject subject, SchoolClass schoolClass);
    boolean existsByFacultyAndSubject(Faculty faculty, Subject subject);
}
