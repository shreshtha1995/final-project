package com.campussync.service;

import com.campussync.dto.posting.CreatePostingRequest;
import com.campussync.dto.posting.PostingResponse;
import com.campussync.exception.ApiException;
import com.campussync.model.Posting;
import com.campussync.model.User;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.PostingStatus;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import com.campussync.repository.PostingRepository;
import com.campussync.repository.WishlistRepository;
import com.campussync.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Listing creation, editing and discovery (FR-3..FR-7).
 * Reads run read-only so lazy associations map to DTOs before the session closes.
 */
@Service
@Transactional(readOnly = true)
public class PostingService {

    /** Day 7: provider is prompted to re-confirm. Day 9: expire if not re-confirmed. */
    public static final int RECONFIRM_AFTER_DAYS = 7;
    public static final int EXPIRE_AFTER_DAYS = 9;

    private final PostingRepository postingRepository;
    private final WishlistRepository wishlistRepository;
    private final CurrentUserService currentUserService;

    public PostingService(PostingRepository postingRepository,
                          WishlistRepository wishlistRepository,
                          CurrentUserService currentUserService) {
        this.postingRepository = postingRepository;
        this.wishlistRepository = wishlistRepository;
        this.currentUserService = currentUserService;
    }

    /**
     * Server-side discovery. The gender filter is applied here, NOT on the client:
     * a MALE seeker only ever receives MALE_ONLY + ANYONE listings, and vice-versa.
     * cityPrefix (city only), officeCampus (exact city+area) and tenantPreference are optional.
     */
    public List<PostingResponse> search(SharingType sharingType, String cityPrefix,
                                        String officeCampus, TenantPreference tenantPreference) {
        User me = currentUserService.get();
        return postingRepository.search(
                        PostingStatus.AVAILABLE, me.getGender(), sharingType,
                        blankToNull(cityPrefix), blankToNull(officeCampus), tenantPreference)
                .stream()
                .map(PostingResponse::from)
                .toList();
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    public PostingResponse getById(Long id) {
        return PostingResponse.from(findOrThrow(id));
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

        int totalBeds = bedsFor(request.sharingType());
        validateBeds(request.availableBeds(), totalBeds);
        validateReviewsForType(me.getIdType(), request);
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
                .expiresAt(now.plusDays(EXPIRE_AFTER_DAYS))
                .reminderSent(false)
                .needsReconfirmation(false)
                .build();

        return PostingResponse.from(postingRepository.save(posting));
    }

    @Transactional
    public PostingResponse update(Long id, CreatePostingRequest request) {
        User me = currentUserService.get();
        Posting posting = findOrThrow(id);
        requireOwner(posting, me);

        int totalBeds = bedsFor(request.sharingType());
        validateBeds(request.availableBeds(), totalBeds);
        validateReviewsForType(me.getIdType(), request);
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
    public void delete(Long id) {
        User me = currentUserService.get();
        Posting posting = findOrThrow(id);
        requireOwner(posting, me);
        wishlistRepository.deleteByPostingId(id);   // remove it from anyone's wishlist first
        postingRepository.delete(posting);
    }

    public List<PostingResponse> myListings() {
        User me = currentUserService.get();
        return postingRepository.findByPostedByIdOrderByCreatedAtDesc(me.getId())
                .stream()
                .map(PostingResponse::from)
                .toList();
    }

    @Transactional
    public PostingResponse confirmStillAvailable(Long id) {
        User me = currentUserService.get();
        Posting posting = findOrThrow(id);
        requireOwner(posting, me);

        LocalDateTime now = LocalDateTime.now();
        posting.setStatus(PostingStatus.AVAILABLE);
        posting.setCreatedAt(now);
        posting.setExpiresAt(now.plusDays(EXPIRE_AFTER_DAYS));
        posting.setReminderSent(false);
        posting.setNeedsReconfirmation(false);
        return PostingResponse.from(postingRepository.save(posting));
    }

    public List<String> officeLocations() {
        return postingRepository.findDistinctOfficeCampuses();
    }

    // ----- helpers -----

    private Posting findOrThrow(Long id) {
        return postingRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Listing not found."));
    }

    private void requireOwner(Posting posting, User me) {
        if (!posting.getPostedBy().getId().equals(me.getId())) {
            throw ApiException.badRequest("You can only modify your own listings.");
        }
    }

    private int bedsFor(SharingType type) {
        return type == SharingType.TRIPLE ? 3 : 2;
    }

    private void validateBeds(int availableBeds, int totalBeds) {
        if (availableBeds < 1 || availableBeds > totalBeds) {
            throw ApiException.badRequest("Vacant beds must be between 1 and " + totalBeds
                    + " for a " + (totalBeds == 3 ? "triple" : "double") + "-sharing room.");
        }
    }

    /** Employees must provide ratings + reviews; candidates may skip them. */
    private void validateReviewsForType(IdType idType, CreatePostingRequest r) {
        if (idType == IdType.EMPLOYEE) {
            if (r.foodRating() == null || r.serviceRating() == null
                    || isBlank(r.foodReview()) || isBlank(r.serviceReview())) {
                throw ApiException.badRequest("Food & service ratings and reviews are required.");
            }
        }
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
