package com.campussync.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/** A reply to a Doubt. */
@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Answer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doubt_id", nullable = false)
    private Doubt doubt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "answered_by_user_id", nullable = false)
    private User answeredBy;

    @Column(nullable = false, length = 2000)
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
