package com.campussync.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Editable profile fields. Currently just the phone number. */
public record UpdateProfileRequest(
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Phone number must be 10 digits") String phoneNumber
) {}
