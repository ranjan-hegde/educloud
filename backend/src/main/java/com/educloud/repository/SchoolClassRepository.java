package com.educloud.repository;

import com.educloud.entity.Course;
import com.educloud.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    Optional<SchoolClass> findByCourseAndSemesterAndSection(Course course, Integer semester, String section);
    List<SchoolClass> findByCourse(Course course);
}
