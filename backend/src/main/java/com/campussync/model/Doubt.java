package com.campussync.model;

import com.campussync.model.enums.DoubtCategory;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** A question posted in the community forum. */
@Entity
@Table(name = "doubts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doubt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asked_by_user_id", nullable = false)
    private User askedBy;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoubtCategory category;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
