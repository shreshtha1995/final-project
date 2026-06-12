package com.campussync.dto.admin;

import com.campussync.model.User;
import com.campussync.model.enums.Gender;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.Role;

/** A registered user as seen by the Super Admin. */
public record UserSummaryResponse(
        Long id,
        String name,
        String email,
        String phoneNumber,
        Gender gender,
        String cognizantId,
        IdType idType,
        Role role
) {
    public static UserSummaryResponse from(User u) {
        return new UserSummaryResponse(u.getId(), u.getName(), u.getEmail(), u.getPhoneNumber(),
                u.getGender(), u.getCognizantId(), u.getIdType(), u.getRole());
    }
}
