package com.campussync.service.storage;

import com.campussync.exception.ApiException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Cloudinary-backed image storage (active when app.storage.type=cloudinary).
 * Uploads each image to Cloudinary and returns its secure CDN URL, which works
 * both locally and after deployment.
 */
@Service
@ConditionalOnProperty(name = "app.storage.type", havingValue = "cloudinary")
public class CloudinaryImageStorage implements ImageStorage {

    private final Cloudinary cloudinary;
    private final String folder;

    public CloudinaryImageStorage(
            @Value("${cloudinary.cloud-name}") String cloudName,
            @Value("${cloudinary.api-key}") String apiKey,
            @Value("${cloudinary.api-secret}") String apiSecret,
            @Value("${cloudinary.folder:campussync}") String folder) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
        this.folder = folder;
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
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(), ObjectUtils.asMap("folder", folder));
            return (String) result.get("secure_url");
        } catch (Exception e) {
            throw ApiException.badRequest("Image upload failed: " + e.getMessage());
        }
    }
}
