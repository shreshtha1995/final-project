package com.campussync.dto.admin;

import com.campussync.model.enums.IdType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Super Admin adds a new valid Cognizant ID to the directory. */
public record AddDirectoryIdRequest(
        @NotBlank String cognizantId,
        @NotNull IdType idType
) {}
