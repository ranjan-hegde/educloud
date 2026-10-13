package com.educloud.repository;

import com.educloud.entity.Faculty;
import com.educloud.entity.Feedback;
import com.educloud.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByStudent(Student student);
    List<Feedback> findByFaculty(Faculty faculty);
}
