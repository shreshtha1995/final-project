package com.campussync.controller;

import com.campussync.dto.posting.CreatePostingRequest;
import com.campussync.dto.posting.PostingResponse;
import com.campussync.service.PostingManagementService;
import com.campussync.service.storage.ImageStorage;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/** Listing creation, editing, image upload and re-confirmation. JWT enforced by SecurityConfig. */
@RestController
@RequestMapping("/api/postings")
public class PostingManagementController {

    private final PostingManagementService postingManagementService;
    private final ImageStorage imageStorage;

    public PostingManagementController(PostingManagementService postingManagementService, ImageStorage imageStorage) {
        this.postingManagementService = postingManagementService;
        this.imageStorage = imageStorage;
    }

    /** Upload one or more PG images; returns { "urls": [...] } to attach to a listing. */
    @PostMapping("/upload-images")
    public Map<String, List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        return Map.of("urls", imageStorage.storeAll(files));
    }

    @PostMapping
    public PostingResponse create(@Valid @RequestBody CreatePostingRequest request) {
        return postingManagementService.create(request);
    }

    /** Edit one of the logged-in user's own listings. */
    @PutMapping("/{id}")
    public PostingResponse update(@PathVariable Long id, @Valid @RequestBody CreatePostingRequest request) {
        return postingManagementService.update(id, request);
    }

    /** Provider re-confirms a listing is still available (resets the expiry clock). */
    @PostMapping("/{id}/confirm")
    public PostingResponse confirm(@PathVariable Long id) {
        return postingManagementService.confirmStillAvailable(id);
    }
}
