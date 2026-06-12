package com.campussync.dto.auth;

import com.campussync.model.User;
import com.campussync.model.enums.Gender;
import com.campussync.model.enums.IdType;

/** Full profile details shown on the user's profile page. */
public record ProfileResponse(
        Long id,
        String name,
        String email,
        String phoneNumber,
        Gender gender,
        String cognizantId,
        IdType idType
) {
    public static ProfileResponse from(User u) {
        return new ProfileResponse(u.getId(), u.getName(), u.getEmail(), u.getPhoneNumber(),
                u.getGender(), u.getCognizantId(), u.getIdType());
    }
}
