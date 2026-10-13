package com.educloud.repository;

import com.educloud.entity.Assignment;
import com.educloud.entity.AssignmentSubmission;
import com.educloud.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, Long> {
    Optional<AssignmentSubmission> findByAssignmentAndStudent(Assignment assignment, Student student);
    List<AssignmentSubmission> findByAssignment(Assignment assignment);
    List<AssignmentSubmission> findByStudent(Student student);
}
