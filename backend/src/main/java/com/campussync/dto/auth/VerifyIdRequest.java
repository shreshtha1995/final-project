package com.campussync.dto.auth;

import jakarta.validation.constraints.NotBlank;

// Step 1 of sign-up: the user types only their Cognizant ID so we can check it
// against the company directory BEFORE collecting the rest of their details.
public record VerifyIdRequest(
        @NotBlank String cognizantId
)
{}
