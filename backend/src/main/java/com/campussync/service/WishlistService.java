package com.campussync.service;

import com.campussync.dto.posting.PostingResponse;
import com.campussync.exception.ApiException;
import com.campussync.model.Posting;
import com.campussync.model.User;
import com.campussync.model.Wishlist;
import com.campussync.repository.PostingRepository;
import com.campussync.repository.WishlistRepository;
import com.campussync.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/** Saved listings ("wishlist") for the logged-in user. */
@Service
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final PostingRepository postingRepository;
    private final CurrentUserService currentUserService;

    public WishlistService(WishlistRepository wishlistRepository,
                           PostingRepository postingRepository,
                           CurrentUserService currentUserService) {
        this.wishlistRepository = wishlistRepository;
        this.postingRepository = postingRepository;
        this.currentUserService = currentUserService;
    }

    /** The user's saved listings, newest first. */
    public List<PostingResponse> list() {
        User me = currentUserService.get();
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(me.getId())
                .stream()
                .map(w -> PostingResponse.from(w.getPosting()))
                .toList();
    }

    /** Posting ids the user has saved (used to show filled/empty hearts). */
    public List<Long> savedIds() {
        return wishlistRepository.findPostingIdsByUserId(currentUserService.get().getId());
    }

    @Transactional
    public void add(Long postingId) {
        User me = currentUserService.get();
        if (wishlistRepository.existsByUserIdAndPostingId(me.getId(), postingId)) {
            return; // already saved — idempotent
        }
        Posting posting = postingRepository.findById(postingId)
                .orElseThrow(() -> ApiException.notFound("Listing not found."));
        wishlistRepository.save(Wishlist.builder()
                .user(me)
                .posting(posting)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Transactional
    public void remove(Long postingId) {
        wishlistRepository.deleteByUserIdAndPostingId(currentUserService.get().getId(), postingId);
    }
}
