package com.campussync.dto.forum;

import com.campussync.model.Answer;

import java.time.LocalDateTime;

public record AnswerResponse(
        Long id,
        String content,
        String answeredByName,
        LocalDateTime createdAt
) {
    public static AnswerResponse from(Answer a) {
        return new AnswerResponse(a.getId(), a.getContent(), a.getAnsweredBy().getName(), a.getCreatedAt());
    }
}
