package com.educloud.service;

import com.educloud.dto.misc.TimetableRequest;
import com.educloud.dto.misc.TimetableResponse;
import com.educloud.entity.*;
import com.educloud.exception.ConflictException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final FacultyRepository facultyRepository;
    private final ClassStudentRepository classStudentRepository;
    private final CurrentUserService currentUserService;

    public List<TimetableResponse> listAll() {
        return timetableRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<TimetableResponse> listForCurrentStudent() {
        Student student = currentUserService.getStudent();
        SchoolClass schoolClass = classStudentRepository.findByStudent(student)
                .map(ClassStudent::getSchoolClass)
                .orElseThrow(() -> new NotFoundException("You are not enrolled in any class yet."));
        return timetableRepository.findBySchoolClass(schoolClass).stream().map(this::toResponse).toList();
    }

    public List<TimetableResponse> listForCurrentFaculty() {
        Faculty faculty = currentUserService.getFaculty();
        return timetableRepository.findByFaculty(faculty).stream().map(this::toResponse).toList();
    }

    @Transactional
    public TimetableResponse create(TimetableRequest req) {
        SchoolClass schoolClass = schoolClassRepository.findById(req.getSchoolClassId()).orElseThrow(() -> new NotFoundException("Class not found."));
        Subject subject = subjectRepository.findById(req.getSubjectId()).orElseThrow(() -> new NotFoundException("Subject not found."));
        Faculty faculty = facultyRepository.findById(req.getFacultyId()).orElseThrow(() -> new NotFoundException("Faculty not found."));

        if (!req.getEndTime().isAfter(req.getStartTime())) {
            throw new com.educloud.exception.BadRequestException("End time must be after start time.");
        }

        boolean clash = timetableRepository.findBySchoolClass(schoolClass).stream().anyMatch(t ->
                t.getDayOfWeek() == req.getDayOfWeek()
                        && req.getStartTime().isBefore(t.getEndTime()) && t.getStartTime().isBefore(req.getEndTime()));
        if (clash) {
            throw new ConflictException("This class already has another period overlapping that time slot.");
        }

        Timetable entry = Timetable.builder()
                .schoolClass(schoolClass).subject(subject).faculty(faculty)
                .dayOfWeek(req.getDayOfWeek()).startTime(req.getStartTime()).endTime(req.getEndTime())
                .room(req.getRoom())
                .build();
        return toResponse(timetableRepository.save(entry));
    }

    @Transactional
    public TimetableResponse update(Long id, TimetableRequest req) {
        Timetable entry = timetableRepository.findById(id).orElseThrow(() -> new NotFoundException("Timetable entry not found."));
        SchoolClass schoolClass = schoolClassRepository.findById(req.getSchoolClassId()).orElseThrow(() -> new NotFoundException("Class not found."));
        Subject subject = subjectRepository.findById(req.getSubjectId()).orElseThrow(() -> new NotFoundException("Subject not found."));
        Faculty faculty = facultyRepository.findById(req.getFacultyId()).orElseThrow(() -> new NotFoundException("Faculty not found."));
        entry.setSchoolClass(schoolClass);
        entry.setSubject(subject);
        entry.setFaculty(faculty);
        entry.setDayOfWeek(req.getDayOfWeek());
        entry.setStartTime(req.getStartTime());
        entry.setEndTime(req.getEndTime());
        entry.setRoom(req.getRoom());
        return toResponse(timetableRepository.save(entry));
    }

    @Transactional
    public void delete(Long id) {
        if (!timetableRepository.existsById(id)) throw new NotFoundException("Timetable entry not found.");
        timetableRepository.deleteById(id);
    }

    private TimetableResponse toResponse(Timetable t) {
        return TimetableResponse.builder()
                .id(t.getId()).schoolClass(t.getSchoolClass().getDisplayName()).subject(t.getSubject().getName())
                .faculty(t.getFaculty().getUser().getName()).dayOfWeek(t.getDayOfWeek())
                .startTime(t.getStartTime()).endTime(t.getEndTime()).room(t.getRoom())
                .build();
    }
}
