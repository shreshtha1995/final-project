package com.campussync.controller;

import com.campussync.dto.posting.PostingResponse;
import com.campussync.service.MyListingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** A provider's own listings: list + delete. JWT enforced by SecurityConfig. */
@RestController
@RequestMapping("/api/postings")
public class MyListingController {

    private final MyListingService myListingService;

    public MyListingController(MyListingService myListingService) {
        this.myListingService = myListingService;
    }

    /** The logged-in provider's own listings. */
    @GetMapping("/mine")
    public List<PostingResponse> mine() {
        return myListingService.myListings();
    }

    /** Delete one of the logged-in user's own listings. */
    @DeleteMapping("/{id}")
    public Map<String, String> delete(@PathVariable Long id) {
        myListingService.delete(id);
        return Map.of("status", "deleted");
    }
}
