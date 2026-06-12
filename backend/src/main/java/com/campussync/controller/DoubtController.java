package com.campussync.controller;

import com.campussync.dto.forum.*;
import com.campussync.model.enums.DoubtCategory;
import com.campussync.service.DoubtService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Community forum endpoints (Doubts + Answers). All require a valid JWT. */
@RestController
@RequestMapping("/api/doubts")
public class DoubtController {

    private final DoubtService doubtService;

    public DoubtController(DoubtService doubtService) {
        this.doubtService = doubtService;
    }

    @GetMapping
    public List<DoubtResponse> list(@RequestParam(required = false) DoubtCategory category) {
        return doubtService.list(category);
    }

    @GetMapping("/{id}")
    public DoubtResponse getWithAnswers(@PathVariable Long id) {
        return doubtService.getWithAnswers(id);
    }

    @PostMapping
    public DoubtResponse ask(@Valid @RequestBody CreateDoubtRequest request) {
        return doubtService.ask(request);
    }

    @PostMapping("/{id}/answers")
    public AnswerResponse answer(@PathVariable Long id, @Valid @RequestBody CreateAnswerRequest request) {
        return doubtService.answer(id, request);
    }
}
