package com.educloud.repository;

import com.educloud.entity.Course;
import com.educloud.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByCourseAndSemester(Course course, Integer semester);
}
