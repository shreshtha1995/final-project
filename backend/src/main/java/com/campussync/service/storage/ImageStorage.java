package com.campussync.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Storage seam for PG images. The default implementation writes to the local
 * filesystem; a GoogleDriveImageStorage can be dropped in later (same interface)
 * once a service-account key + folder ID are supplied — no other code changes.
 */
public interface ImageStorage {

    /** Stores one image and returns its public URL. */
    String store(MultipartFile file);

    /** Stores several images and returns their URLs in order. */
    List<String> storeAll(MultipartFile[] files);
}
