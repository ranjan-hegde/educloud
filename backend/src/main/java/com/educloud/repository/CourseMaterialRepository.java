package com.educloud.repository;

import com.educloud.entity.CourseMaterial;
import com.educloud.entity.Faculty;
import com.educloud.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findByFaculty(Faculty faculty);
    List<CourseMaterial> findBySubject(Subject subject);
    List<CourseMaterial> findBySubjectIn(List<Subject> subjects);
}
