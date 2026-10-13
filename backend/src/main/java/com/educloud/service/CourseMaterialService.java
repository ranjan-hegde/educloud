package com.educloud.service;

import com.educloud.dto.misc.MaterialRequest;
import com.educloud.dto.misc.MaterialResponse;
import com.educloud.entity.*;
import com.educloud.exception.ForbiddenException;
import com.educloud.exception.NotFoundException;
import com.educloud.repository.*;
import com.educloud.security.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CourseMaterialService {

    private final CourseMaterialRepository materialRepository;
    private final SubjectRepository subjectRepository;
    private final FacultySubjectAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final FileStorageService fileStorageService;
    private final CurrentUserService currentUserService;

    public List<MaterialResponse> listAll() {
        return materialRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<MaterialResponse> listForCurrentStudent() {
        Student student = currentUserService.getStudent();
        List<Subject> subjects = subjectRepository.findByCourseAndSemester(student.getCourse(), student.getSemester());
        return materialRepository.findBySubjectIn(subjects).stream().map(this::toResponse).toList();
    }

    @Transactional
    public MaterialResponse create(MaterialRequest req, MultipartFile file) {
        Faculty faculty = currentUserService.getFaculty();
        Subject subject = subjectRepository.findById(req.getSubjectId()).orElseThrow(() -> new NotFoundException("Subject not found."));
        if (!assignmentRepository.existsByFacultyAndSubject(faculty, subject)) {
            throw new ForbiddenException("You are not assigned to this subject.");
        }
        String url = null;
        if (file != null && !file.isEmpty()) {
            url = fileStorageService.store(file, "materials/" + subject.getId()).url();
        }
        CourseMaterial material = CourseMaterial.builder()
                .title(req.getTitle()).subject(subject).faculty(faculty).type(req.getType()).fileUrl(url)
                .build();
        return toResponse(materialRepository.save(material));
    }

    @Transactional
    public MaterialResponse update(Long id, MaterialRequest req) {
        CourseMaterial material = materialRepository.findById(id).orElseThrow(() -> new NotFoundException("Material not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!material.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only edit your own materials.");
        }
        material.setTitle(req.getTitle());
        material.setType(req.getType());
        return toResponse(materialRepository.save(material));
    }

    @Transactional
    public void delete(Long id) {
        CourseMaterial material = materialRepository.findById(id).orElseThrow(() -> new NotFoundException("Material not found."));
        Faculty faculty = currentUserService.getFaculty();
        if (!material.getFaculty().getId().equals(faculty.getId())) {
            throw new ForbiddenException("You can only delete your own materials.");
        }
        materialRepository.delete(material);
    }

    private MaterialResponse toResponse(CourseMaterial m) {
        return MaterialResponse.builder()
                .id(m.getId()).title(m.getTitle()).subject(m.getSubject().getName()).subjectId(m.getSubject().getId())
                .faculty(m.getFaculty().getUser().getName()).type(m.getType()).fileUrl(m.getFileUrl())
                .uploadedAt(m.getCreatedAt())
                .build();
    }
}
