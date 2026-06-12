package com.campussync.dto.forum;

import com.campussync.model.enums.DoubtCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDoubtRequest(
        @NotBlank String title,
        @NotBlank String content,
        @NotNull DoubtCategory category
) {}
