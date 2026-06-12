package com.campussync.dto.forum;

import jakarta.validation.constraints.NotBlank;

public record CreateAnswerRequest(
        @NotBlank String content
) {}
