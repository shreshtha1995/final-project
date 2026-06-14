package com.campussync.dto.posting;

import com.campussync.model.Posting;
import com.campussync.model.enums.PostingStatus;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Listing details returned to the client. Includes the provider's phone (FR-7). */
public record PostingResponse(
        Long id,
        String pgName,
        String localityAndLandmark,
        String officeCampus,
        SharingType sharingType,
        TenantPreference tenantPreference,
        Integer totalBeds,
        Integer availableBeds,
        BigDecimal rentAmount,
        Integer foodRating,
        String foodReview,
        Integer serviceRating,
        String serviceReview,
        List<String> imageUrls,
        PostingStatus status,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        boolean needsReconfirmation,
        String providerName,
        String providerPhone
) {
    public static PostingResponse from(Posting p) {
        return new PostingResponse(
                p.getId(),
                p.getPgName(),
                p.getLocalityAndLandmark(),
                p.getOfficeCampus(),
                p.getSharingType(),
                p.getTenantPreference(),
                p.getTotalBeds(),
                p.getAvailableBeds(),
                p.getRentAmount(),
                p.getFoodRating(),
                p.getFoodReview(),
                p.getServiceRating(),
                p.getServiceReview(),
                p.getImageUrls(),
                p.getStatus(),
                p.getCreatedAt(),
                p.getExpiresAt(),
                p.isNeedsReconfirmation(),
                p.getPostedBy().getName(),
                p.getPostedBy().getPhoneNumber()
        );
    }
}
