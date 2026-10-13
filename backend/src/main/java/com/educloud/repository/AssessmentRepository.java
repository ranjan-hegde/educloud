package com.educloud.repository;

import com.educloud.entity.Assessment;
import com.educloud.entity.Faculty;
import com.educloud.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByFaculty(Faculty faculty);
    List<Assessment> findBySchoolClass(SchoolClass schoolClass);
}
