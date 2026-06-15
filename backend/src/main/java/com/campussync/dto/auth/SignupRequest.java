package com.campussync.dto.auth;

import com.campussync.model.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

// Step 2 of sign-up: the full profile the user submits AFTER their Cognizant ID
// has been verified. Jackson maps the incoming JSON onto this record at runtime.
// idType/role are NOT taken from the client — the server derives them from the
// verified directory entry so they can't be spoofed.
public record SignupRequest(
        @NotBlank String cognizantId,
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String phoneNumber,
        @NotNull Gender gender,
        @NotBlank String password
)
{}
