package com.campussync.dto.auth;

import com.campussync.model.enums.Gender;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.Role;

/** Returned after a successful signup or login. The frontend stores the token. */
public record AuthResponse(
        String token,
        Long userId,
        String name,
        String email,
        Gender gender,
        Role role,
        IdType idType
) {}
