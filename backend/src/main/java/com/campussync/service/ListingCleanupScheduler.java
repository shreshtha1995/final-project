package com.campussync.service;

import com.campussync.model.Posting;
import com.campussync.model.enums.PostingStatus;
import com.campussync.repository.PostingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * FR-9 / Workflow 4: daily background job for the listing lifecycle.
 *  - Day 7 (created_at + 7d): email the provider to re-confirm, flag the listing.
 *  - Day 9 (expires_at): if still not re-confirmed, mark EXPIRED so it leaves Browse.
 */
@Component
public class ListingCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(ListingCleanupScheduler.class);

    private final PostingRepository postingRepository;
    private final EmailService emailService;

    public ListingCleanupScheduler(PostingRepository postingRepository, EmailService emailService) {
        this.postingRepository = postingRepository;
        this.emailService = emailService;
    }

    /** Runs every day at 02:00. (cron = second minute hour day month weekday) */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void runLifecycleJob() {
        sendReconfirmReminders();
        expireStaleListings();
    }

    /** Day 7: prompt providers (email) and surface the re-confirm button. */
    void sendReconfirmReminders() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(PostingSupport.RECONFIRM_AFTER_DAYS);
        List<Posting> due = postingRepository
                .findByStatusAndReminderSentFalseAndCreatedAtBefore(PostingStatus.AVAILABLE, cutoff);
        for (Posting p : due) {
            p.setReminderSent(true);
            p.setNeedsReconfirmation(true);
            emailService.sendListingExpiryReminder(p);
        }
        if (!due.isEmpty()) {
            postingRepository.saveAll(due);
            log.info("Sent {} reconfirm reminder(s).", due.size());
        }
    }

    /** Day 9: expire listings that were never re-confirmed. */
    void expireStaleListings() {
        LocalDateTime now = LocalDateTime.now();
        List<Posting> stale = postingRepository
                .findByStatusAndExpiresAtBefore(PostingStatus.AVAILABLE, now);
        if (stale.isEmpty()) {
            return;
        }
        stale.forEach(p -> p.setStatus(PostingStatus.EXPIRED));
        postingRepository.saveAll(stale);
        log.info("Expired {} stale listing(s).", stale.size());
    }
}
