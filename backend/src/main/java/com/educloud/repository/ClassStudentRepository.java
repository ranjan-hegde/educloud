package com.educloud.repository;

import com.educloud.entity.ClassStudent;
import com.educloud.entity.SchoolClass;
import com.educloud.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassStudentRepository extends JpaRepository<ClassStudent, Long> {
    Optional<ClassStudent> findByStudent(Student student);
    List<ClassStudent> findBySchoolClass(SchoolClass schoolClass);
}
