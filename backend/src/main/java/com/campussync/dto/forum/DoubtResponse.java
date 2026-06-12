package com.campussync.dto.forum;

import com.campussync.model.Doubt;
import com.campussync.model.enums.DoubtCategory;

import java.time.LocalDateTime;
import java.util.List;

/** Forum question. In a list, answers is null and answerCount is set; in detail view answers is populated. */
public record DoubtResponse(
        Long id,
        String title,
        String content,
        DoubtCategory category,
        String askedByName,
        LocalDateTime createdAt,
        Integer answerCount,
        List<AnswerResponse> answers
) {
    public static DoubtResponse summary(Doubt d, int answerCount) {
        return new DoubtResponse(d.getId(), d.getTitle(), d.getContent(), d.getCategory(),
                d.getAskedBy().getName(), d.getCreatedAt(), answerCount, null);
    }

    public static DoubtResponse detail(Doubt d, List<AnswerResponse> answers) {
        return new DoubtResponse(d.getId(), d.getTitle(), d.getContent(), d.getCategory(),
                d.getAskedBy().getName(), d.getCreatedAt(), answers.size(), answers);
    }
}
