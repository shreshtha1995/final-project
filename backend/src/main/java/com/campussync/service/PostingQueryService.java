package com.campussync.service;

import com.campussync.dto.posting.PostingResponse;
import com.campussync.model.User;
import com.campussync.model.enums.PostingStatus;
import com.campussync.model.enums.SharingType;
import com.campussync.model.enums.TenantPreference;
import com.campussync.repository.PostingRepository;
import com.campussync.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Listing discovery / browse (FR-3..FR-7, read side).
 * Reads run read-only so lazy associations map to DTOs before the session closes.
 */
@Service
@Transactional(readOnly = true)
public class PostingQueryService {

    private final PostingRepository postingRepository;
    private final CurrentUserService currentUserService;
    private final PostingSupport support;

    public PostingQueryService(PostingRepository postingRepository,
                               CurrentUserService currentUserService,
                               PostingSupport support) {
        this.postingRepository = postingRepository;
        this.currentUserService = currentUserService;
        this.support = support;
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
                        support.blankToNull(cityPrefix), support.blankToNull(officeCampus), tenantPreference)
                .stream()
                .map(PostingResponse::from)
                .toList();
    }

    public PostingResponse getById(Long id) {
        return PostingResponse.from(support.findOrThrow(id));
    }

    public List<String> officeLocations() {
        return postingRepository.findDistinctOfficeCampuses();
    }
}
