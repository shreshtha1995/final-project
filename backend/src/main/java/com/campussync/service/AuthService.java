package com.campussync.service;

import com.campussync.dto.auth.AuthResponse;
import com.campussync.dto.auth.LoginRequest;
import com.campussync.dto.auth.SignupRequest;
import com.campussync.dto.auth.VerifyIdRequest;
import com.campussync.dto.auth.VerifyIdResponse;
import com.campussync.exception.ApiException;
import com.campussync.model.CompanyDirectory;
import com.campussync.model.User;
import com.campussync.model.enums.Role;
import com.campussync.repository.CompanyDirectoryRepository;
import com.campussync.repository.UserRepository;
import com.campussync.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business logic for verified onboarding (FR-1) and stateless JWT auth.
 *
 * Sign-up is a two-step flow:
 *   1. verifyId  — the Cognizant ID must EXIST in the directory and be UNUSED.
 *   2. signup    — only then is the account created and the ID marked registered
 *                  so it can never be reused.
 * idType/role are taken from the trusted directory row, never from the client.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyDirectoryRepository directoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       CompanyDirectoryRepository directoryRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.directoryRepository = directoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Step 1: is this Cognizant ID usable for sign-up?
     * Returns a status object (not an error) so the UI can react inline — valid=false
     * when the ID is unknown or has already been used to create an account.
     */
    public VerifyIdResponse verifyId(VerifyIdRequest request) {
        var entry = directoryRepository.findByCognizantId(request.cognizantId());
        if (entry.isEmpty()) {
            return new VerifyIdResponse(false, null, "This Cognizant ID is not in the company directory.");
        }
        CompanyDirectory directory = entry.get();
        if (directory.isRegistered()) {
            return new VerifyIdResponse(false, directory.getIdType(),
                    "This Cognizant ID has already been used to register an account.");
        }
        return new VerifyIdResponse(true, directory.getIdType(), "Cognizant ID verified.");
    }

    /**
     * Step 2: create the account. Re-validates the ID server-side (a client could skip
     * step 1), marks the directory row registered, and returns a fresh JWT.
     * Transactional so the user insert and the "is_registered" flip commit together.
     */
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        CompanyDirectory directory = directoryRepository.findByCognizantId(request.cognizantId())
                .orElseThrow(() -> ApiException.badRequest("This Cognizant ID is not in the company directory."));

        if (directory.isRegistered()) {
            throw ApiException.conflict("This Cognizant ID has already been used to register an account.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("An account with this email already exists.");
        }

        User user = User.builder()
                .cognizantId(directory.getCognizantId())
                .name(request.name())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .gender(request.gender())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .idType(directory.getIdType())   // trusted: copied from the directory, not the client
                .build();
        user = userRepository.save(user);

        // Burn the ID so it can never be reused for another account.
        directory.setRegistered(true);
        directoryRepository.save(directory);

        return toAuthResponse(user);
    }

    /**
     * Authenticate by email + password. Delegates credential checking to Spring
     * Security (which uses CustomUserDetailsService + BCrypt), then issues a JWT.
     */
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (AuthenticationException ex) {
            throw ApiException.unauthorized("Invalid email or password.");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password."));
        return toAuthResponse(user);
    }

    /** Build the login/signup payload: a signed token (subject = email) + minimal profile. */
    private AuthResponse toAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getGender(),
                user.getRole(),
                user.getIdType());
    }
}
