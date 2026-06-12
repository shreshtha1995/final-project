package com.campussync.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** A saved (wishlisted) listing for a user. One row per (user, posting). */
@Entity
@Table(name = "wishlist", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "posting_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "posting_id", nullable = false)
    private Posting posting;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
