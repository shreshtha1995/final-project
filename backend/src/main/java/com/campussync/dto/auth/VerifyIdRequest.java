package com.campussync.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record VerifyIdRequest(
        @NotBlank(message = "Cognizant ID is required") String cognizantId
) {}
