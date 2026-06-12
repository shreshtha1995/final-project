package com.campussync.repository;

import com.campussync.model.Posting;
import com.campussync.model.enums.Gender;
import com.campussync.model.enums.PostingStatus;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PostingRepository extends JpaRepository<Posting, Long> {

    /**
     * Server-side discovery query (FR-3, FR-4, FR-5).
     * Strict gender rule: you share the room with the provider, so a seeker only ever
     * sees listings whose PROVIDER is the same gender. PG type / sharing / location are
     * optional sub-filters (null = ignore).
     */
    @Query("""
            SELECT p FROM Posting p
            WHERE p.status = :status
              AND p.postedBy.gender = :gender
              AND (:sharingType IS NULL OR p.sharingType = :sharingType)
              AND (:cityPrefix IS NULL OR p.officeCampus LIKE CONCAT(:cityPrefix, '%'))
              AND (:officeCampus IS NULL OR p.officeCampus = :officeCampus)
              AND (:tenantPreference IS NULL OR p.tenantPreference = :tenantPreference)
            ORDER BY p.createdAt DESC
            """)
    List<Posting> search(@Param("status") PostingStatus status,
                         @Param("gender") Gender gender,
                         @Param("sharingType") SharingType sharingType,
                         @Param("cityPrefix") String cityPrefix,
                         @Param("officeCampus") String officeCampus,
                         @Param("tenantPreference") TenantPreference tenantPreference);

    /** Listings owned by a given provider. */
    List<Posting> findByPostedByIdOrderByCreatedAtDesc(Long userId);

    /** Distinct office locations used to populate the filter dropdown. */
    @Query("SELECT DISTINCT p.officeCampus FROM Posting p WHERE p.status = com.campussync.model.enums.PostingStatus.AVAILABLE ORDER BY p.officeCampus")
    List<String> findDistinctOfficeCampuses();

    /** Duplicate-listing guard: same provider, same PG name + campus, still active. */
    boolean existsByPostedByIdAndPgNameIgnoreCaseAndOfficeCampusIgnoreCaseAndStatus(
            Long userId, String pgName, String officeCampus, PostingStatus status);

    /** Active listings whose reconfirm window has opened but the reminder hasn't been sent. */
    List<Posting> findByStatusAndReminderSentFalseAndCreatedAtBefore(PostingStatus status, LocalDateTime reminderCutoff);

    /** Active listings past their expiry that were never re-confirmed. */
    List<Posting> findByStatusAndExpiresAtBefore(PostingStatus status, LocalDateTime time);
}
