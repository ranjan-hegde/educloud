package com.educloud.repository;

import com.educloud.entity.Assignment;
import com.educloud.entity.Faculty;
import com.educloud.entity.SchoolClass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByFaculty(Faculty faculty);
    List<Assignment> findBySchoolClass(SchoolClass schoolClass);
}
