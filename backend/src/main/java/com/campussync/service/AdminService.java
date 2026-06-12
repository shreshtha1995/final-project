package com.campussync.service;

import com.campussync.dto.admin.AddDirectoryIdRequest;
import com.campussync.dto.admin.DirectoryEntryResponse;
import com.campussync.dto.admin.UserSummaryResponse;
import com.campussync.exception.ApiException;
import com.campussync.model.CompanyDirectory;
import com.campussync.model.User;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.Role;
import com.campussync.repository.CompanyDirectoryRepository;
import com.campussync.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

/** Super Admin operations: company directory + registered users. */
@Service
@Transactional(readOnly = true)
public class AdminService {

    /** Employee IDs look like CTS1001; candidate IDs look like CAND2001. */
    private static final Pattern EMPLOYEE_PATTERN = Pattern.compile("CTS\\d{3,}");
    private static final Pattern CANDIDATE_PATTERN = Pattern.compile("CAND\\d{3,}");

    private final CompanyDirectoryRepository directoryRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public AdminService(CompanyDirectoryRepository directoryRepository,
                        UserRepository userRepository,
                        UserService userService) {
        this.directoryRepository = directoryRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    /** All registered users (admins excluded from deletion but shown). */
    public List<UserSummaryResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(UserSummaryResponse::from)
                .toList();
    }

    /** Delete any user (and all their data); frees their Cognizant ID. Admins cannot be deleted. */
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found."));
        if (user.getRole() == Role.SUPER_ADMIN) {
            throw ApiException.conflict("A Super Admin account cannot be deleted.");
        }
        userService.purge(user);
    }

    public List<DirectoryEntryResponse> listDirectory() {
        return directoryRepository.findAllByOrderByCreatedAtDescIdDesc().stream()
                .map(DirectoryEntryResponse::from)
                .toList();
    }

    @Transactional
    public DirectoryEntryResponse addId(AddDirectoryIdRequest request) {
        String id = request.cognizantId() == null ? "" : request.cognizantId().trim().toUpperCase();
        IdType type = request.idType();

        validateFormat(id, type);

        directoryRepository.findByCognizantId(id).ifPresent(e -> {
            throw ApiException.conflict("This ID already exists in the directory.");
        });

        CompanyDirectory entry = CompanyDirectory.builder()
                .cognizantId(id)
                .idType(type)
                .registered(false)
                .createdAt(LocalDateTime.now())
                .build();
        return DirectoryEntryResponse.from(directoryRepository.save(entry));
    }

    /** Enforces the ID pattern AND that the prefix matches the selected type. */
    private void validateFormat(String id, IdType type) {
        if (id.isBlank()) {
            throw ApiException.badRequest("ID is required.");
        }
        if (type == IdType.EMPLOYEE && !EMPLOYEE_PATTERN.matcher(id).matches()) {
            throw ApiException.badRequest("Employee ID must look like CTS1001 (CTS followed by digits).");
        }
        if (type == IdType.CANDIDATE && !CANDIDATE_PATTERN.matcher(id).matches()) {
            throw ApiException.badRequest("Candidate ID must look like CAND2001 (CAND followed by digits).");
        }
    }

    @Transactional
    public void deleteId(Long id) {
        CompanyDirectory entry = directoryRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Directory entry not found."));
        if (entry.isRegistered()) {
            throw ApiException.conflict("Cannot delete: this ID is already in use by a registered account.");
        }
        directoryRepository.delete(entry);
    }
}
