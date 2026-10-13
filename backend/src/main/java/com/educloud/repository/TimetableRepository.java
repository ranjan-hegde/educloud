package com.educloud.repository;

import com.educloud.entity.Faculty;
import com.educloud.entity.SchoolClass;
import com.educloud.entity.Timetable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {
    List<Timetable> findBySchoolClass(SchoolClass schoolClass);
    List<Timetable> findByFaculty(Faculty faculty);
}
