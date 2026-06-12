package com.campussync.controller;

import com.campussync.dto.auth.*;
import com.campussync.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/** Public onboarding + login endpoints (no JWT required). */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Step 1: check the Cognizant ID against the directory. */
    @PostMapping("/verify-id")
    public VerifyIdResponse verifyId(@Valid @RequestBody VerifyIdRequest request) {
        return authService.verifyId(request);
    }

    /** Step 2: create the account. */
    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
