package com.educloud.repository;

import com.educloud.entity.AttendanceSession;
import com.educloud.entity.Faculty;
import com.educloud.entity.SchoolClass;
import com.educloud.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    Optional<AttendanceSession> findByQrToken(String qrToken);
    List<AttendanceSession> findByFaculty(Faculty faculty);
    List<AttendanceSession> findByFacultyAndDate(Faculty faculty, LocalDate date);
    List<AttendanceSession> findBySchoolClassAndDate(SchoolClass schoolClass, LocalDate date);
    List<AttendanceSession> findByStatus(SessionStatus status);
}
