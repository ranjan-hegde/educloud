package com.educloud.repository;

import com.educloud.entity.Marks;
import com.educloud.entity.Student;
import com.educloud.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MarksRepository extends JpaRepository<Marks, Long> {
    List<Marks> findByStudent(Student student);
    Optional<Marks> findByStudentAndSubjectAndSemester(Student student, Subject subject, Integer semester);
    List<Marks> findBySubject(Subject subject);
}
