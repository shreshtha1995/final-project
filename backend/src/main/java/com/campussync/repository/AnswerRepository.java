package com.campussync.repository;

import com.campussync.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByDoubtIdOrderByCreatedAtAsc(Long doubtId);
    long countByDoubtId(Long doubtId);
    List<Answer> findByAnsweredById(Long userId);
}
