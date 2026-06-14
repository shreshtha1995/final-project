package com.campussync.config;

import com.campussync.model.CompanyDirectory;
import com.campussync.model.User;
import com.campussync.model.enums.Gender;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.Role;
import com.campussync.repository.CompanyDirectoryRepository;
import com.campussync.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds, on first startup:
 *  - a few valid Cognizant IDs in the directory (so sign-up can be demoed), and
 *  - one default Super Admin account.
 *
 * Demo sign-up IDs: CTS1001..CTS1005 (employees), CAND2001..CAND2003 (candidates).
 * Super Admin login: admin@campussync.com / Admin@123
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    public static final String ADMIN_EMAIL = "admin@campussync.com";
    public static final String ADMIN_PASSWORD = "Admin@123";

    private final CompanyDirectoryRepository directoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(CompanyDirectoryRepository directoryRepository,
                      UserRepository userRepository,
                      PasswordEncoder passwordEncoder) {
        this.directoryRepository = directoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedDirectory();
        seedSuperAdmin();
        backfillRoles();
    }

    /** Older user rows created before the role column existed have NULL role; default them to USER. */
    private void backfillRoles() {
        var toFix = userRepository.findAll().stream()
                .filter(u -> u.getRole() == null)
                .peek(u -> u.setRole(Role.USER))
                .toList();
        if (!toFix.isEmpty()) {
            userRepository.saveAll(toFix);
            log.info("Backfilled role=USER on {} legacy user(s).", toFix.size());
        }
    }

    private void seedDirectory() {
        if (directoryRepository.count() > 0) {
            return; // already seeded
        }
        List<CompanyDirectory> entries = List.of(
                entry("CTS1001", IdType.EMPLOYEE),
                entry("CTS1002", IdType.EMPLOYEE),
                entry("CTS1003", IdType.EMPLOYEE),
                entry("CTS1004", IdType.EMPLOYEE),
                entry("CTS1005", IdType.EMPLOYEE),
                entry("CAND2001", IdType.CANDIDATE),
                entry("CAND2002", IdType.CANDIDATE),
                entry("CAND2003", IdType.CANDIDATE)
        );
        directoryRepository.saveAll(entries);
        log.info("Seeded {} company directory IDs (CTS1001-1005, CAND2001-2003).", entries.size());
    }

    private void seedSuperAdmin() {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            return;
        }
        User admin = User.builder()
                .cognizantId("SUPERADMIN")
                .name("Super Admin")
                .email(ADMIN_EMAIL)
                .phoneNumber("0000000000")
                .gender(Gender.MALE)
                .password(passwordEncoder.encode(ADMIN_PASSWORD))
                .role(Role.SUPER_ADMIN)
                .build();
        userRepository.save(admin);
        log.info("Seeded default Super Admin account: {} / {}", ADMIN_EMAIL, ADMIN_PASSWORD);
    }

    private CompanyDirectory entry(String cognizantId, IdType type) {
        return CompanyDirectory.builder()
                .cognizantId(cognizantId)
                .idType(type)
                .registered(false)
                .createdAt(java.time.LocalDateTime.now())
                .build();
    }
}
