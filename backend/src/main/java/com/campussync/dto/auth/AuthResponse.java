package com.campussync.dto.auth;

import com.campussync.model.enums.Gender;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.Role;

// What login + signup return: the signed JWT plus the minimal user profile the
// frontend keeps in sessionStorage. The client attaches `token` to every later
// request. idType is null for the Super Admin (who has no directory id type).
public record AuthResponse(
        String token,
        Long userId,
        String name,
        String email,
        Gender gender,
        Role role,
        IdType idType
)
{}
