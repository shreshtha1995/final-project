package com.campussync.controller;

import com.campussync.dto.posting.PostingResponse;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import com.campussync.service.PostingQueryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Listing discovery / browse endpoints. All require a valid JWT (enforced by SecurityConfig). */
@RestController
@RequestMapping("/api/postings")
public class PostingQueryController {

    private final PostingQueryService postingQueryService;

    public PostingQueryController(PostingQueryService postingQueryService) {
        this.postingQueryService = postingQueryService;
    }

    /** Discover listings. Gender filter is applied server-side; others are optional. */
    @GetMapping
    public List<PostingResponse> search(@RequestParam(required = false) SharingType sharingType,
                                        @RequestParam(required = false) String city,
                                        @RequestParam(required = false) String officeCampus,
                                        @RequestParam(required = false) TenantPreference tenantPreference) {
        return postingQueryService.search(sharingType, city, officeCampus, tenantPreference);
    }

    /** Distinct office locations for the filter dropdown. */
    @GetMapping("/locations")
    public List<String> locations() {
        return postingQueryService.officeLocations();
    }

    @GetMapping("/{id}")
    public PostingResponse getById(@PathVariable Long id) {
        return postingQueryService.getById(id);
    }
}
