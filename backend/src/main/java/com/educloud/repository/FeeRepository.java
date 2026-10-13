package com.educloud.repository;

import com.educloud.entity.Fee;
import com.educloud.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FeeRepository extends JpaRepository<Fee, Long> {
    List<Fee> findByStudent(Student student);
    Optional<Fee> findByStudentAndAcademicYear(Student student, String academicYear);
}
