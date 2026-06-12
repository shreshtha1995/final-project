package com.campussync.repository;

import com.campussync.model.CompanyDirectory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CompanyDirectoryRepository extends JpaRepository<CompanyDirectory, Long> {
    Optional<CompanyDirectory> findByCognizantId(String cognizantId);
    List<CompanyDirectory> findAllByOrderByCreatedAtDescIdDesc();
}
