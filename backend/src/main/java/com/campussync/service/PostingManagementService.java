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

@Service
public class PostingManagementService {

    private final PostingRepository postingRepository;
    private final CurrentUserService currentUserService;
    private final PostingSupport postingSupport;

    public PostingManagementService(PostingRepository postingRepository, CurrentUserService currentUserService, PostingSupport postingSupport) {
        this.postingRepository = postingRepository;
        this.currentUserService = currentUserService;
        this.postingSupport = postingSupport;
    }
    // any changes to database must be consistent
    //creating a listing method( builder, record automatic getters are used)
    @Transactional
    public PostingResponse create(CreatePostingRequest posting) {
        //to get user which posted the posting
        User u=currentUserService.get();

        //to check if duplicate entry
        boolean duplicate=postingRepository.existsByPostedByIdAndPgNameIgnoreCaseAndOfficeCampusIgnoreCaseAndStatus(u.getId(), posting.pgName(),posting.officeCampus(), PostingStatus.AVAILABLE);
        if(duplicate){
            throw ApiException.conflict("You already have an active listing for \"" + posting.pgName().trim()
                    + "\" at " + posting.officeCampus().trim()+ ".");
        }


        //only employee have to fill review , candidate should not add review
        IdType idType=u.getIdType();
        postingSupport.validateReviewsForType(idType,posting);

        //checking if it's an employee or candidate so that while filling reviews in table we can put null is its a candidate
        boolean candidate= idType == IdType.CANDIDATE;

        int totalbeds=postingSupport.bedsFor(posting.sharingType());
        //throws api exception if available beds is 0 or > total beds
        postingSupport.validateBeds(posting.availableBeds(),totalbeds);

        //calculating created at and expiry at
        LocalDateTime now=LocalDateTime.now();
        LocalDateTime expiryTime=now.plusDays(PostingSupport.EXPIRE_AFTER_DAYS);

        Posting post=Posting.builder()
                .postedBy(u)
                .pgName(posting.pgName().trim())
                .localityAndLandmark(posting.localityAndLandmark())
                .officeCampus(posting.officeCampus().trim())
                .sharingType(posting.sharingType())
                .totalBeds(totalbeds)
                .tenantPreference(posting.tenantPreference())
                .availableBeds(posting.availableBeds())
                .rentAmount(posting.rentAmount())
                .foodReview(candidate?null:posting.foodReview())
                .foodRating(candidate?null:posting.foodRating())
                .serviceRating(candidate?null:posting.serviceRating())
                .serviceReview(candidate?null:posting.serviceReview())
                .status(PostingStatus.AVAILABLE)
                .createdAt(now)
                .expiresAt(expiryTime)
                .imageUrls(posting.imageUrls()==null? List.of():posting.imageUrls())
                .reminderSent(false)
                .needsReconfirmation(false)
                .build();


//converts the posting to posting response DTO to send to controller
        return PostingResponse.from(postingRepository.save(post));

    }

    //Editing a posting , takes id of posting and new data as arguments
    @Transactional
    public PostingResponse update(Long id,CreatePostingRequest request){

        User u=currentUserService.get();
        //gets the posting from repo based on the id
        Posting posting=postingSupport.findOrThrow(id);
        //checking if user can edit this posting as user can only edit its own listing
        postingSupport.requireOwner(posting,u);

        //only employee have to fill review , candidate should not add review
        IdType idType=u.getIdType();
        postingSupport.validateReviewsForType(idType,request);

        //checking if it's an employee or candidate so that while filling reviews in table we can put null is its a candidate
        boolean candidate= idType != IdType.EMPLOYEE;

        int totalbeds=postingSupport.bedsFor(request.sharingType());
        //throws api exception if available beds is 0 or > total beds
        postingSupport.validateBeds(request.availableBeds(),totalbeds);

        //now updating the database
        posting.setPgName(request.pgName().trim());
        posting.setLocalityAndLandmark(request.localityAndLandmark());
        posting.setOfficeCampus(request.officeCampus().trim());
        posting.setSharingType(request.sharingType());
        posting.setTenantPreference(request.tenantPreference());
        posting.setTotalBeds(totalbeds);
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

    //we will reconfirm that this post is still available and return posting response
    @Transactional
    public PostingResponse confirmStillAvailable(Long id) {
        User u=currentUserService.get();
        Posting post=postingSupport.findOrThrow(id);
        postingSupport.requireOwner(post,u);
        //new date is now set for expiry
        LocalDateTime now=LocalDateTime.now();
        LocalDateTime expire=now.plusDays(PostingSupport.EXPIRE_AFTER_DAYS);

        post.setCreatedAt(now);
        post.setExpiresAt(expire);
        post.setReminderSent(false);
        post.setNeedsReconfirmation(false);
        post.setStatus(PostingStatus.AVAILABLE);

        return PostingResponse.from(postingRepository.save(post));

    }
}
