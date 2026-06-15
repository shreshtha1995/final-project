package com.campussync.controller;

import com.campussync.dto.auth.AuthResponse;
import com.campussync.dto.auth.LoginRequest;
import com.campussync.dto.auth.SignupRequest;
import com.campussync.dto.auth.VerifyIdRequest;
import com.campussync.dto.auth.VerifyIdResponse;
import com.campussync.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public auth endpoints (whitelisted in SecurityConfig as /api/auth/**).
 * Thin layer: validate the request body (@Valid) and hand off to AuthService.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Step 1 of signup — check a Cognizant ID against the directory. */
    @PostMapping("/verify-id")
    public VerifyIdResponse verifyId(@Valid @RequestBody VerifyIdRequest request) {
        return authService.verifyId(request);
    }

    /** Step 2 of signup — create the account and return a JWT. */
    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    /** Authenticate an existing user and return a JWT. */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}
