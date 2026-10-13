package com.educloud.service;

import com.educloud.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/** Stores uploaded files (assignment submissions, course materials) on local disk under app.upload.dir. */
@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public StoredFile store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded.");
        }
        try {
            Path dir = Paths.get(uploadDir, subfolder);
            Files.createDirectories(dir);
            String original = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String stored = UUID.randomUUID() + "-" + original;
            Path target = dir.resolve(stored);
            file.transferTo(target);
            String url = "/uploads/" + subfolder + "/" + stored;
            return new StoredFile(url, original);
        } catch (IOException e) {
            throw new BadRequestException("Failed to store the uploaded file: " + e.getMessage());
        }
    }

    public record StoredFile(String url, String originalName) {}
}
