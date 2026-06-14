package com.campussync.controller;

import com.campussync.dto.auth.ProfileResponse;
import com.campussync.dto.auth.UpdateProfileRequest;
import com.campussync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Profile + account management for the logged-in user. */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ProfileResponse me() {
        return userService.profile();
    }

    /** Update the logged-in user's phone number. */
    @PutMapping("/me")
    public ProfileResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updatePhone(request.phoneNumber());
    }

    @DeleteMapping("/me")
    public Map<String, String> deleteMe() {
        userService.deleteAccount();
        return Map.of("status", "account deleted");
    }
}
