package com.campussync.service;

import com.campussync.dto.auth.*;
import com.campussync.exception.ApiException;
import com.campussync.model.CompanyDirectory;
import com.campussync.model.User;
import com.campussync.repository.CompanyDirectoryRepository;
import com.campussync.repository.UserRepository;
import com.campussync.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Onboarding + login. Implements FR-1 (ID verification) and FR-2 (profile + auth). */
@Service
public class AuthService {

    private final CompanyDirectoryRepository directoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(CompanyDirectoryRepository directoryRepository,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.directoryRepository = directoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /** Step 1 of onboarding: the ID must exist in the Super Admin DB and be unused. */
    public VerifyIdResponse verifyId(VerifyIdRequest request) {
        CompanyDirectory entry = directoryRepository.findByCognizantId(request.cognizantId().trim())
                .orElseThrow(() -> ApiException.notFound("This ID is not in the company directory."));

        if (entry.isRegistered()) {
            throw ApiException.conflict("This ID has already been used to create an account.");
        }
        return new VerifyIdResponse(true, entry.getIdType(), "ID verified. You may continue sign-up.");
    }

    /** Step 2: create the account, hash the password, and mark the ID as used. */
    @Transactional
    public AuthResponse signup(SignupRequest request) {
        CompanyDirectory entry = directoryRepository.findByCognizantId(request.cognizantId().trim())
                .orElseThrow(() -> ApiException.notFound("This ID is not in the company directory."));

        if (entry.isRegistered()) {
            throw ApiException.conflict("This ID has already been used to create an account.");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("An account with this email already exists.");
        }

        User user = User.builder()
                .cognizantId(entry.getCognizantId())
                .name(request.name())
                .email(request.email())
                .phoneNumber(request.phoneNumber())
                .gender(request.gender())
                .password(passwordEncoder.encode(request.password()))
                .idType(entry.getIdType())
                .build();
        userRepository.save(user);

        entry.setRegistered(true);          // ID can no longer be reused
        directoryRepository.save(entry);
        
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw ApiException.unauthorized("Invalid email or password.");
        }
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(),
                user.getGender(), user.getRole(), user.getIdType());
    }
}
