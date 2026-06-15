package com.campussync.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;


// container for incoming data (JSON) TO convert in JAVA objects
// Done by Jackson at runtime
public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
)
{}
