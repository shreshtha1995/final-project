package com.campussync.dto.admin;

import com.campussync.model.CompanyDirectory;
import com.campussync.model.enums.IdType;

public record DirectoryEntryResponse(
        Long id,
        String cognizantId,
        IdType idType,
        boolean registered
) {
    public static DirectoryEntryResponse from(CompanyDirectory d) {
        return new DirectoryEntryResponse(d.getId(), d.getCognizantId(), d.getIdType(), d.isRegistered());
    }
}
