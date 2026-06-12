package com.campussync.dto.auth;

import com.campussync.model.enums.Gender;
import jakarta.validation.constraints.*;

public record SignupRequest(
        @NotBlank(message = "Cognizant ID is required") String cognizantId,
        @NotBlank(message = "Name is required") String name,
        @NotBlank @Email(message = "A valid email is required") String email,
        @NotBlank @Pattern(regexp = "\\d{10}", message = "Phone number must be 10 digits") String phoneNumber,
        @NotNull(message = "Gender is required") Gender gender,
        @NotBlank
        @Size(min = 6, message = "Password must be at least 6 characters")
        @Pattern(regexp = "\\S+", message = "Password must not contain spaces")
        String password
) {}
