package com.campussync.service;

import com.campussync.dto.forum.*;
import com.campussync.exception.ApiException;
import com.campussync.model.Answer;
import com.campussync.model.Doubt;
import com.campussync.model.User;
import com.campussync.model.enums.DoubtCategory;
import com.campussync.repository.AnswerRepository;
import com.campussync.repository.DoubtRepository;
import com.campussync.security.CurrentUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/** Community forum: post and reply to categorized questions (FR-8). */
@Service
@Transactional(readOnly = true)
public class DoubtService {

    private final DoubtRepository doubtRepository;
    private final AnswerRepository answerRepository;
    private final CurrentUserService currentUserService;

    public DoubtService(DoubtRepository doubtRepository,
                        AnswerRepository answerRepository,
                        CurrentUserService currentUserService) {
        this.doubtRepository = doubtRepository;
        this.answerRepository = answerRepository;
        this.currentUserService = currentUserService;
    }

    public List<DoubtResponse> list(DoubtCategory category) {
        List<Doubt> doubts = (category == null)
                ? doubtRepository.findAllByOrderByCreatedAtDesc()
                : doubtRepository.findByCategoryOrderByCreatedAtDesc(category);
        return doubts.stream()
                .map(d -> DoubtResponse.summary(d, (int) answerRepository.countByDoubtId(d.getId())))
                .toList();
    }

    public DoubtResponse getWithAnswers(Long id) {
        Doubt doubt = doubtRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Question not found."));
        List<AnswerResponse> answers = answerRepository.findByDoubtIdOrderByCreatedAtAsc(id)
                .stream().map(AnswerResponse::from).toList();
        return DoubtResponse.detail(doubt, answers);
    }

    @Transactional
    public DoubtResponse ask(CreateDoubtRequest request) {
        User me = currentUserService.get();
        Doubt doubt = Doubt.builder()
                .askedBy(me)
                .title(request.title())
                .content(request.content())
                .category(request.category())
                .createdAt(LocalDateTime.now())
                .build();
        return DoubtResponse.summary(doubtRepository.save(doubt), 0);
    }

    @Transactional
    public AnswerResponse answer(Long doubtId, CreateAnswerRequest request) {
        User me = currentUserService.get();
        Doubt doubt = doubtRepository.findById(doubtId)
                .orElseThrow(() -> ApiException.notFound("Question not found."));
        Answer answer = Answer.builder()
                .doubt(doubt)
                .answeredBy(me)
                .content(request.content())
                .createdAt(LocalDateTime.now())
                .build();
        return AnswerResponse.from(answerRepository.save(answer));
    }
}
