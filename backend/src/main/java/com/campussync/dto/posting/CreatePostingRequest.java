package com.campussync.dto.posting;

import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Provider's listing form. Core fields are always required.
 * Ratings (1-5) + reviews are required for EMPLOYEES and optional for CANDIDATES
 * (enforced in PostingService based on the user's id type).
 */
public record CreatePostingRequest(
        @NotBlank String pgName,
        @NotBlank String localityAndLandmark,
        @NotBlank String officeCampus,
        @NotNull SharingType sharingType,
        @NotNull TenantPreference tenantPreference,
        @NotNull @Min(1) Integer availableBeds,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal rentAmount,
        @Min(1) @Max(5) Integer foodRating,
        String foodReview,
        @Min(1) @Max(5) Integer serviceRating,
        String serviceReview,
        List<String> imageUrls
) {}
