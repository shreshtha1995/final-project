package com.campussync.model;

import com.campussync.model.enums.PostingStatus;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A vacant-bed listing created by a Provider.
 * Food/service ratings + reviews are mandatory (enforced in the service/DTO layer).
 */
@Entity
@Table(name = "postings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Posting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The provider who created this listing. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posted_by_user_id", nullable = false)
    private User postedBy;

    @Column(name = "pg_name", nullable = false)
    private String pgName;

    @Column(name = "locality_and_landmark", nullable = false)
    private String localityAndLandmark;

    /** e.g. "Chennai - Siruseri". Seekers filter by this. */
    @Column(name = "office_campus", nullable = false)
    private String officeCampus;

    @Enumerated(EnumType.STRING)
    @Column(name = "sharing_type", nullable = false)
    private SharingType sharingType;

    @Enumerated(EnumType.STRING)
    @Column(name = "tenant_preference", nullable = false)
    private TenantPreference tenantPreference;

    @Column(name = "rent_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal rentAmount;

    /** Total beds in the room (2 for DOUBLE, 3 for TRIPLE). */
    @Column(name = "total_beds", nullable = false)
    private Integer totalBeds;

    /** How many of those beds are currently vacant. */
    @Column(name = "available_beds", nullable = false)
    private Integer availableBeds;

    // Ratings/reviews are required for employees but optional for new joinees
    // (candidates may know of a vacancy without having lived there).
    @Column(name = "food_rating")
    private Integer foodRating;        // 1-5

    @Column(name = "food_review", length = 1000)
    private String foodReview;

    @Column(name = "service_rating")
    private Integer serviceRating;     // 1-5

    @Column(name = "service_review", length = 1000)
    private String serviceReview;

    /** Zero or more image URLs (local /uploads/... or a Drive link). */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "posting_images", joinColumns = @JoinColumn(name = "posting_id"))
    @Column(name = "image_url", length = 1000)
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostingStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /** When the listing auto-expires if the provider does not re-confirm. */
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    /** True once the day-7 reconfirm reminder email has been sent (avoids duplicates). */
    @Column(name = "reminder_sent", nullable = false)
    @Builder.Default
    private boolean reminderSent = false;

    /** True while the provider is being asked to re-confirm (shows the button in "My Listings"). */
    @Column(name = "needs_reconfirmation", nullable = false)
    @Builder.Default
    private boolean needsReconfirmation = false;
}
