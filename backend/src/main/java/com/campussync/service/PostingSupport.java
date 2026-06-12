package com.campussync.service;

import com.campussync.dto.posting.CreatePostingRequest;
import com.campussync.exception.ApiException;
import com.campussync.model.Posting;
import com.campussync.model.User;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.SharingType;
import com.campussync.repository.PostingRepository;
import org.springframework.stereotype.Component;

/**
 * Shared "posting-core": lifecycle constants and helpers used by the
 * query / management / my-listing posting services. Behaviour-neutral —
 * these were extracted verbatim from the original PostingService so the
 * three feature services can be owned independently without duplicating logic.
 */
@Component
public class PostingSupport {

    /** Day 7: provider is prompted to re-confirm. Day 9: expire if not re-confirmed. */
    public static final int RECONFIRM_AFTER_DAYS = 7;
    public static final int EXPIRE_AFTER_DAYS = 9;

    private final PostingRepository postingRepository;

    public PostingSupport(PostingRepository postingRepository) {
        this.postingRepository = postingRepository;
    }

    public Posting findOrThrow(Long id) {
        return postingRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Listing not found."));
    }

    public void requireOwner(Posting posting, User me) {
        if (!posting.getPostedBy().getId().equals(me.getId())) {
            throw ApiException.badRequest("You can only modify your own listings.");
        }
    }

    public int bedsFor(SharingType type) {
        return type == SharingType.TRIPLE ? 3 : 2;
    }

    public void validateBeds(int availableBeds, int totalBeds) {
        if (availableBeds < 1 || availableBeds > totalBeds) {
            throw ApiException.badRequest("Vacant beds must be between 1 and " + totalBeds
                    + " for a " + (totalBeds == 3 ? "triple" : "double") + "-sharing room.");
        }
    }

    /** Employees must provide ratings + reviews; candidates may skip them. */
    public void validateReviewsForType(IdType idType, CreatePostingRequest r) {
        if (idType == IdType.EMPLOYEE) {
            if (r.foodRating() == null || r.serviceRating() == null
                    || isBlank(r.foodReview()) || isBlank(r.serviceReview())) {
                throw ApiException.badRequest("Food & service ratings and reviews are required.");
            }
        }
    }

    public String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
