package com.campussync.service.storage;

import com.campussync.exception.ApiException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Default image storage: writes files under the upload directory and serves them
 * at /uploads/<file>. Active unless app.storage.type=drive.
 */
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "local", matchIfMissing = true)
public class LocalImageStorage implements ImageStorage {

    private final Path uploadDir;

    public LocalImageStorage(@Value("${app.upload.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    void init() {
        try {
            Files.createDirectories(uploadDir);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public List<String> storeAll(MultipartFile[] files) {
        List<String> urls = new ArrayList<>();
        if (files != null) {
            for (MultipartFile f : files) {
                urls.add(store(f));
            }
        }
        return urls;
    }

    @Override
    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("No image file provided.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw ApiException.badRequest("Only image files are allowed.");
        }

        String original = file.getOriginalFilename() == null ? "" : file.getOriginalFilename();
        String ext = "";
        int dot = original.lastIndexOf('.');
        if (dot >= 0) {
            ext = original.substring(dot);
        }
        String filename = UUID.randomUUID() + ext;

        try {
            Path target = uploadDir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw ApiException.badRequest("Failed to store image: " + e.getMessage());
        }
        return "/uploads/" + filename;
    }
}
