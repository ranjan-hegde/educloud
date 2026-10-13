package com.educloud.service;

import com.educloud.dto.academic.MarksRequest;
import com.educloud.dto.academic.MarksResponse;
import com.educloud.entity.*;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarksService {

    private final MarksRepository marksRepository;
    private final StudentRepository studentRepository;
    private final SubjectRepository subjectRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final CurrentUserService currentUserService;

    public List<MarksResponse> getStudentMarks() {
        Student student = currentUserService.getStudent();
        return marksRepository.findByStudent(student).stream().map(this::toResponse).toList();
    }

    public List<MarksResponse> getSubjectMarks(Long subjectId) {
        // Faculty can only view marks for subjects they actually teach.
        Faculty faculty = currentUserService.getFaculty();
        Subject subject = subjectRepository.findById(subjectId).orElseThrow(() -> new NotFoundException("Subject not found."));
        if (!assignmentRepository.existsByFacultyAndSubject(faculty, subject)) {
            throw new ForbiddenException("You are not assigned to this subject.");
        }
        return marksRepository.findBySubject(subject).stream().map(this::toResponse).toList();
    }

    @Transactional
    public MarksResponse saveMarks(MarksRequest req) {
        Faculty faculty = currentUserService.getFaculty();
        Subject subject = subjectRepository.findById(req.getSubjectId()).orElseThrow(() -> new NotFoundException("Subject not found."));
        if (!assignmentRepository.existsByFacultyAndSubject(faculty, subject)) {
            throw new ForbiddenException("You can only manage marks for subjects you're assigned to teach.");
        }
        Student student = studentRepository.findById(req.getStudentId()).orElseThrow(() -> new NotFoundException("Student not found."));

        Marks marks = marksRepository.findByStudentAndSubjectAndSemester(student, subject, req.getSemester())
                .orElse(Marks.builder().student(student).subject(subject).semester(req.getSemester()).build());
        marks.setInternal(req.getInternal());
        marks.setExternal(req.getExternal());
        marks.setEnteredBy(faculty);
        return toResponse(marksRepository.save(marks));
    }

    @Transactional
    public MarksResponse updateMarks(Long id, MarksRequest req) {
        Marks marks = marksRepository.findById(id).orElseThrow(() -> new NotFoundException("Marks record not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!assignmentRepository.existsByFacultyAndSubject(faculty, marks.getSubject())) {
            throw new ForbiddenException("You can only manage marks for subjects you're assigned to teach.");
        }
        marks.setInternal(req.getInternal());
        marks.setExternal(req.getExternal());
        marks.setEnteredBy(faculty);
        return toResponse(marksRepository.save(marks));
    }

    @Transactional
    public void deleteMarks(Long id) {
        Marks marks = marksRepository.findById(id).orElseThrow(() -> new NotFoundException("Marks record not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!assignmentRepository.existsByFacultyAndSubject(faculty, marks.getSubject())) {
            throw new ForbiddenException("You can only manage marks for subjects you're assigned to teach.");
        }
        marksRepository.delete(marks);
    }

    public Object getSummary() {
        Student student = currentUserService.getStudent();
        List<Marks> all = marksRepository.findByStudent(student);
        int totalMax = all.size() * 100;
        int totalScored = all.stream().mapToInt(Marks::getTotal).sum();
        double percentage = totalMax == 0 ? 0 : (totalScored * 100.0 / totalMax);
        return new java.util.HashMap<>() {{
            put("subjectsCount", all.size());
            put("totalScored", totalScored);
            put("totalMax", totalMax);
            put("percentage", Math.round(percentage * 100.0) / 100.0);
        }};
    }

    private MarksResponse toResponse(Marks m) {
        return MarksResponse.builder()
                .id(m.getId())
                .studentId(m.getStudent().getId())
                .studentName(m.getStudent().getUser().getName())
                .subjectId(m.getSubject().getId())
                .subject(m.getSubject().getName())
                .semester(m.getSemester())
                .internal(m.getInternal())
                .external(m.getExternal())
                .total(m.getTotal())
                .grade(m.getGrade())
                .build();
    }
}
