package com.campussync.service;

import com.campussync.dto.auth.ProfileResponse;
import com.campussync.model.Doubt;
import com.campussync.model.Posting;
import com.campussync.model.User;
import com.campussync.repository.*;
import com.campussync.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Profile retrieval and account deletion for the logged-in user. */
@Service
@Transactional(readOnly = true)
public class UserService {

    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final PostingRepository postingRepository;
    private final DoubtRepository doubtRepository;
    private final AnswerRepository answerRepository;
    private final CompanyDirectoryRepository directoryRepository;
    private final WishlistRepository wishlistRepository;

    public UserService(CurrentUserService currentUserService,
                       UserRepository userRepository,
                       PostingRepository postingRepository,
                       DoubtRepository doubtRepository,
                       AnswerRepository answerRepository,
                       CompanyDirectoryRepository directoryRepository,
                       WishlistRepository wishlistRepository) {
        this.currentUserService = currentUserService;
        this.userRepository = userRepository;
        this.postingRepository = postingRepository;
        this.doubtRepository = doubtRepository;
        this.answerRepository = answerRepository;
        this.directoryRepository = directoryRepository;
        this.wishlistRepository = wishlistRepository;
    }

    public ProfileResponse profile() {
        return ProfileResponse.from(currentUserService.get());
    }

    /** Update the logged-in user's editable fields (phone number). */
    @Transactional
    public ProfileResponse updatePhone(String phoneNumber) {
        User me = currentUserService.get();
        me.setPhoneNumber(phoneNumber);
        return ProfileResponse.from(userRepository.save(me));
    }

    /** Deletes the current user and all their data (self-service). */
    @Transactional
    public void deleteAccount() {
        purge(currentUserService.get());
    }

    /**
     * Removes a user and everything they own (listings, doubts, answers),
     * then frees their Cognizant ID so it can be registered again.
     * Reused by self-delete and by the Super Admin's delete-user action.
     */
    @Transactional
    public void purge(User user) {
        // 1. Answers written by this user
        answerRepository.deleteAll(answerRepository.findByAnsweredById(user.getId()));

        // 2. This user's questions and any answers under them
        List<Doubt> doubts = doubtRepository.findByAskedById(user.getId());
        for (Doubt d : doubts) {
            answerRepository.deleteAll(answerRepository.findByDoubtIdOrderByCreatedAtAsc(d.getId()));
        }
        doubtRepository.deleteAll(doubts);

        // 3. Wishlist: this user's own saves, plus anyone who saved this user's listings
        wishlistRepository.deleteByUserId(user.getId());
        List<Posting> myPostings = postingRepository.findByPostedByIdOrderByCreatedAtDesc(user.getId());
        for (Posting p : myPostings) {
            wishlistRepository.deleteByPostingId(p.getId());
        }
        postingRepository.deleteAll(myPostings);

        // 4. Free the Cognizant ID for re-registration
        directoryRepository.findByCognizantId(user.getCognizantId()).ifPresent(entry -> {
            entry.setRegistered(false);
            directoryRepository.save(entry);
        });

        // 5. Finally remove the account
        userRepository.delete(user);
    }
}
