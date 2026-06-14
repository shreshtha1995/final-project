package com.campussync.model;

import com.campussync.model.enums.IdType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * The Super Admin's master list of valid Cognizant IDs.
 * Sign-up is only allowed if an ID exists here and is not yet registered.
 */
@Entity
@Table(name = "company_directory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDirectory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cognizant_id", nullable = false, unique = true)
    private String cognizantId;

    @Enumerated(EnumType.STRING)
    @Column(name = "id_type", nullable = false)
    private IdType idType;

    /** false until the ID has been used to create a USER account. */
    @Column(name = "is_registered", nullable = false)
    private boolean registered = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
