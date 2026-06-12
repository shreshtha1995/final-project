package com.campussync.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank @jakarta.validation.constraints.Email String email,
        @NotBlank String password
) {}
