package com.campussync.dto.auth;

import com.campussync.model.enums.IdType;

public record VerifyIdResponse(
        boolean valid,
        IdType idType,
        String message
) {}
