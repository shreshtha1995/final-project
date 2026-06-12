package com.campussync.service;

import com.campussync.dto.posting.CreatePostingRequest;
import com.campussync.dto.posting.PostingResponse;
import com.campussync.exception.ApiException;
import com.campussync.model.Posting;
import com.campussync.model.User;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.PostingStatus;
import com.campussync.repository.PostingRepository;
import com.campussync.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Listing creation, editing, image upload and re-confirmation (FR-3..FR-7, write side).
 */
@Service
public class PostingManagementService {

    private final PostingRepository postingRepository;
    private final CurrentUserService currentUserService;
    private final PostingSupport support;

    public PostingManagementService(PostingRepository postingRepository,
                                    CurrentUserService currentUserService,
                                    PostingSupport support) {
        this.postingRepository = postingRepository;
        this.currentUserService = currentUserService;
        this.support = support;
    }

    @Transactional
    public PostingResponse create(CreatePostingRequest request) {
        User me = currentUserService.get();

        boolean duplicate = postingRepository.existsByPostedByIdAndPgNameIgnoreCaseAndOfficeCampusIgnoreCaseAndStatus(
                me.getId(), request.pgName().trim(), request.officeCampus().trim(), PostingStatus.AVAILABLE);
        if (duplicate) {
            throw ApiException.conflict("You already have an active listing for \"" + request.pgName()
                    + "\" at " + request.officeCampus() + ".");
        }

        int totalBeds = support.bedsFor(request.sharingType());
        support.validateBeds(request.availableBeds(), totalBeds);
        support.validateReviewsForType(me.getIdType(), request);
        boolean candidate = me.getIdType() == IdType.CANDIDATE;

        LocalDateTime now = LocalDateTime.now();
        Posting posting = Posting.builder()
                .postedBy(me)
                .pgName(request.pgName().trim())
                .localityAndLandmark(request.localityAndLandmark())
                .officeCampus(request.officeCampus().trim())
                .sharingType(request.sharingType())
                .tenantPreference(request.tenantPreference())
                .totalBeds(totalBeds)
                .availableBeds(request.availableBeds())
                .rentAmount(request.rentAmount())
                .foodRating(candidate ? null : request.foodRating())
                .foodReview(candidate ? null : request.foodReview())
                .serviceRating(candidate ? null : request.serviceRating())
                .serviceReview(candidate ? null : request.serviceReview())
                .imageUrls(request.imageUrls() == null ? List.of() : request.imageUrls())
                .status(PostingStatus.AVAILABLE)
                .createdAt(now)
                .expiresAt(now.plusDays(PostingSupport.EXPIRE_AFTER_DAYS))
                .reminderSent(false)
                .needsReconfirmation(false)
                .build();

        return PostingResponse.from(postingRepository.save(posting));
    }

    @Transactional
    public PostingResponse update(Long id, CreatePostingRequest request) {
        User me = currentUserService.get();
        Posting posting = support.findOrThrow(id);
        support.requireOwner(posting, me);

        int totalBeds = support.bedsFor(request.sharingType());
        support.validateBeds(request.availableBeds(), totalBeds);
        support.validateReviewsForType(me.getIdType(), request);
        boolean candidate = me.getIdType() == IdType.CANDIDATE;

        posting.setPgName(request.pgName().trim());
        posting.setLocalityAndLandmark(request.localityAndLandmark());
        posting.setOfficeCampus(request.officeCampus().trim());
        posting.setSharingType(request.sharingType());
        posting.setTenantPreference(request.tenantPreference());
        posting.setTotalBeds(totalBeds);
        posting.setAvailableBeds(request.availableBeds());
        posting.setRentAmount(request.rentAmount());
        posting.setFoodRating(candidate ? null : request.foodRating());
        posting.setFoodReview(candidate ? null : request.foodReview());
        posting.setServiceRating(candidate ? null : request.serviceRating());
        posting.setServiceReview(candidate ? null : request.serviceReview());
        if (request.imageUrls() != null) {
            posting.setImageUrls(request.imageUrls());
        }
        return PostingResponse.from(postingRepository.save(posting));
    }

    @Transactional
    public PostingResponse confirmStillAvailable(Long id) {
        User me = currentUserService.get();
        Posting posting = support.findOrThrow(id);
        support.requireOwner(posting, me);

        LocalDateTime now = LocalDateTime.now();
        posting.setStatus(PostingStatus.AVAILABLE);
        posting.setCreatedAt(now);
        posting.setExpiresAt(now.plusDays(PostingSupport.EXPIRE_AFTER_DAYS));
        posting.setReminderSent(false);
        posting.setNeedsReconfirmation(false);
        return PostingResponse.from(postingRepository.save(posting));
    }
}
