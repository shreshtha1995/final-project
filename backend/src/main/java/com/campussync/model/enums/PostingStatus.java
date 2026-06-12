package com.campussync.model.enums;

/** Lifecycle of a listing. The scheduler flips AVAILABLE -> EXPIRED once expires_at passes. */
public enum PostingStatus {
    AVAILABLE,
    PENDING,
    EXPIRED
}
