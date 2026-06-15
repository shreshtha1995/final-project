package com.campussync.dto.auth;

import com.campussync.model.enums.IdType;

// Outgoing JSON for the verify-id step. Tells the UI whether the ID can be used
// to sign up, and (when valid) whether it belongs to an EMPLOYEE or CANDIDATE so
// the form can confirm the role the user picked. Jackson serialises this to JSON.
public record VerifyIdResponse(
        boolean valid,
        IdType idType,
        String message
)
{}
