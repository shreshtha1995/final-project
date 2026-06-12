package com.campussync.model;

import com.campussync.model.enums.Gender;
import com.campussync.model.enums.IdType;
import com.campussync.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;

/**
 * A verified platform user. cognizant_id matches a row in company_directory.
 * The password is stored BCrypt-hashed (never in plain text).
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cognizant_id", nullable = false, unique = true)
    private String cognizantId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    /** BCrypt hash. */
    @Column(nullable = false)
    private String password;

    /** USER for employees/candidates, SUPER_ADMIN for the directory owner. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    /** EMPLOYEE or CANDIDATE (null for the admin). Copied from the directory at sign-up. */
    @Enumerated(EnumType.STRING)
    @Column(name = "id_type")
    private IdType idType;
}
