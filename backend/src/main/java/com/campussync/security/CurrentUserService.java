package com.campussync.security;

import com.campussync.exception.ApiException;
import com.campussync.model.User;
import com.campussync.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/** Convenience: returns the User entity for the currently authenticated request. */
@Service
public class CurrentUserService {

    @Autowired
    private UserRepository userRepository;

    // get the Current user
    
    public User get() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw ApiException.unauthorized("Not authenticated");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> ApiException.unauthorized("Authenticated user not found"));
    }
}
