package com.campussync.controller;

import com.campussync.dto.posting.CreatePostingRequest;
import com.campussync.dto.posting.PostingResponse;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import com.campussync.service.PostingService;
import com.campussync.service.storage.ImageStorage;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/** Listing endpoints. All require a valid JWT (enforced by SecurityConfig). */
@RestController
@RequestMapping("/api/postings")
public class PostingController {

    private final PostingService postingService;
    private final ImageStorage imageStorage;

    public PostingController(PostingService postingService, ImageStorage imageStorage) {
        this.postingService = postingService;
        this.imageStorage = imageStorage;
    }

    /** Upload one or more PG images; returns { "urls": [...] } to attach to a listing. */
    @PostMapping("/upload-images")
    public Map<String, List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        return Map.of("urls", imageStorage.storeAll(files));
    }

    /** Discover listings. Gender filter is applied server-side; others are optional. */
    @GetMapping
    public List<PostingResponse> search(@RequestParam(required = false) SharingType sharingType,
                                        @RequestParam(required = false) String city,
                                        @RequestParam(required = false) String officeCampus,
                                        @RequestParam(required = false) TenantPreference tenantPreference) {
        return postingService.search(sharingType, city, officeCampus, tenantPreference);
    }

    /** Distinct office locations for the filter dropdown. */
    @GetMapping("/locations")
    public List<String> locations() {
        return postingService.officeLocations();
    }

    /** The logged-in provider's own listings. */
    @GetMapping("/mine")
    public List<PostingResponse> mine() {
        return postingService.myListings();
    }

    @GetMapping("/{id}")
    public PostingResponse getById(@PathVariable Long id) {
        return postingService.getById(id);
    }

    @PostMapping
    public PostingResponse create(@Valid @RequestBody CreatePostingRequest request) {
        return postingService.create(request);
    }

    /** Edit one of the logged-in user's own listings. */
    @PutMapping("/{id}")
    public PostingResponse update(@PathVariable Long id, @Valid @RequestBody CreatePostingRequest request) {
        return postingService.update(id, request);
    }

    /** Delete one of the logged-in user's own listings. */
    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        postingService.delete(id);
        return Map.of("status", "deleted");
    }

    /** Provider re-confirms a listing is still available (resets the expiry clock). */
    @PostMapping("/{id}/confirm")
    public PostingResponse confirm(@PathVariable Long id) {
        return postingService.confirmStillAvailable(id);
    }
}
