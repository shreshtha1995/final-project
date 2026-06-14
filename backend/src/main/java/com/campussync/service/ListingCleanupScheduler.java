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


@Component
public class ListingCleanupScheduler {

    //logger is a tool to write mesaages to the applications lof output
    private static final Logger log= LoggerFactory.getLogger(ListingCleanupScheduler.class);
    private final PostingRepository postingRepository;
    private final EmailService emailService;


    //constructor injection
    public ListingCleanupScheduler(PostingRepository postingRepository, EmailService emailService) {
        this.postingRepository = postingRepository;
        this.emailService = emailService;
    }

    // schedule this job to run everyday at 2 am
    //put it in one transaction to keep db consistent
    @Scheduled(cron="0 0 2 * * *")
    @Transactional
    public void runLifecycleJob(){
        // method to send reminders to those who need to reconfirm there vacancy
        sendReconfirmReminder();
        // method to expire those listing whose expiry date has passed and no re confirmation came
        expireStaleListings();

    }


    private void sendReconfirmReminder() {
        //if we see from todays date, which date is 7 days before of today, that will be the cut off, all dates at this cutoff or before this cutoff needs reminder
        LocalDateTime cutoff=LocalDateTime.now().minusDays(PostingSupport.RECONFIRM_AFTER_DAYS);

        //find all postings where the status is AVAILABLE and reminderSent is false and createdAt is before the cutoff. In plain English: "available listings, older than 7 days, that I haven't already emailed about
        List<Posting> postingList=postingRepository.findByStatusAndReminderSentFalseAndCreatedAtBefore(PostingStatus.AVAILABLE,cutoff);


        //no posting reconfirm date is there
        if(postingList.isEmpty()){
            return;
        }
        // for each posting , we will call email service to send reminder , for now in log
        for(Posting p:postingList){
            emailService.sendListingExpiryReminder(p);
            //now set reminder set as true
            //It marks reminderSent = true (so tomorrow's run skips it) and needsReconfirmation = true (this is the flag  frontend reads to show the provider a "re-confirm" button).
            p.setNeedsReconfirmation(true);
            p.setReminderSent(true);

        }
        postingRepository.saveAll(postingList);
        log.info("Reminders sent to all {} users",postingList.size());

    }

    private void expireStaleListings() {
        LocalDateTime cutoff=LocalDateTime.now();
//every posting has a date it expires at find those postings whole that date is at or before todays' date
        List<Posting> expired=postingRepository.findByStatusAndExpiresAtBefore(PostingStatus.AVAILABLE,cutoff);
        if(expired.isEmpty()){
            return;
        }

        for(Posting p:expired){
            p.setStatus(PostingStatus.EXPIRED);
            p.setNeedsReconfirmation(false);

        }

        postingRepository.saveAll(expired);
        log.info("{} listings have been expired",expired.size());
    }

}
