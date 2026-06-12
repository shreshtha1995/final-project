package com.campussync.service;

import com.campussync.dto.posting.PostingResponse;
import com.campussync.model.Posting;
import com.campussync.model.User;
import com.campussync.repository.PostingRepository;
import com.campussync.repository.WishlistRepository;
import com.campussync.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * A provider's own listings: list + delete (FR-3..FR-7).
 * Reads run read-only so lazy associations map to DTOs before the session closes.
 */
@Service
@Transactional(readOnly = true)
public class MyListingService {

    private final PostingRepository postingRepository;
    private final WishlistRepository wishlistRepository;
    private final CurrentUserService currentUserService;
    private final PostingSupport support;

    public MyListingService(PostingRepository postingRepository,
                            WishlistRepository wishlistRepository,
                            CurrentUserService currentUserService,
                            PostingSupport support) {
        this.postingRepository = postingRepository;
        this.wishlistRepository = wishlistRepository;
        this.currentUserService = currentUserService;
        this.support = support;
    }

    public List<PostingResponse> myListings() {
        User me = currentUserService.get();
        return postingRepository.findByPostedByIdOrderByCreatedAtDesc(me.getId())
                .stream()
                .map(PostingResponse::from)
                .toList();
    }

    @Transactional
    public void delete(Long id) {
        User me = currentUserService.get();
        Posting posting = support.findOrThrow(id);
        support.requireOwner(posting, me);
        wishlistRepository.deleteByPostingId(id);   // remove it from anyone's wishlist first
        postingRepository.delete(posting);
    }
}
