package com.campussync.controller;

import com.campussync.dto.posting.PostingResponse;
import com.campussync.service.WishlistService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Saved-listings (wishlist) endpoints. Require a valid JWT. */
@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    public List<PostingResponse> list() {
        return wishlistService.list();
    }

    @GetMapping("/ids")
    public List<Long> savedIds() {
        return wishlistService.savedIds();
    }

    @PostMapping("/{postingId}")
    public Map<String, String> add(@PathVariable Long postingId) {
        wishlistService.add(postingId);
        return Map.of("status", "added");
    }

    @DeleteMapping("/{postingId}")
    public Map<String, String> remove(@PathVariable Long postingId) {
        wishlistService.remove(postingId);
        return Map.of("status", "removed");
    }
}
