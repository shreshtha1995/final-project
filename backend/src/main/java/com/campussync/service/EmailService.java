package com.campussync.service;

import com.campussync.model.Posting;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Sends user notifications. This implementation "sends" by logging the email
 * (no SMTP credentials needed for the demo). To send for real, replace the body
 * of send() with a JavaMailSender call and add spring-boot-starter-mail config.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    public void sendListingExpiryReminder(Posting posting) {
        String to = posting.getPostedBy().getEmail();
        String subject = "Action needed: re-confirm your CampusSync listing";
        String body = """
                Hi %s,

                Your listing "%s" (%s) was posted on %s and will EXPIRE on %s
                unless you re-confirm it is still available.

                Open CampusSync -> My Listings and click "Re-confirm" before the expiry date,
                otherwise the listing will be removed from Browse automatically.

                - CampusSync
                """.formatted(
                posting.getPostedBy().getName(),
                posting.getPgName(),
                posting.getOfficeCampus(),
                posting.getCreatedAt().toLocalDate(),
                posting.getExpiresAt().toLocalDate());

        // --- Demo: log instead of sending. Swap for JavaMailSender to send for real. ---
        log.info("\n===== EMAIL (simulated) =====\nTo: {}\nSubject: {}\n{}\n=============================", to, subject, body);
    }
}
