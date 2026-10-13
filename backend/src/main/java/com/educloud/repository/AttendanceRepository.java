package com.educloud.repository;

import com.educloud.entity.Attendance;
import com.educloud.entity.AttendanceSession;
import com.educloud.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    Optional<Attendance> findByStudentAndSession(Student student, AttendanceSession session);
    boolean existsByStudentAndSession(Student student, AttendanceSession session);
    List<Attendance> findByStudent(Student student);
    List<Attendance> findBySession(AttendanceSession session);
    List<Attendance> findByStudentAndSession_Subject_Id(Student student, Long subjectId);
}
