package com.campussync.repository;

import com.campussync.model.Doubt;
import com.campussync.model.enums.DoubtCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DoubtRepository extends JpaRepository<Doubt, Long> {
    List<Doubt> findAllByOrderByCreatedAtDesc();
    List<Doubt> findByCategoryOrderByCreatedAtDesc(DoubtCategory category);
    List<Doubt> findByAskedById(Long userId);
}
