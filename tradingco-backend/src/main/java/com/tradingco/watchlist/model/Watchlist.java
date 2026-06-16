package com.tradingco.watchlist.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "watchlists")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "watchlist_items", joinColumns = @JoinColumn(name = "watchlist_id"))
    @Column(name = "symbol", length = 20)
    @OrderColumn(name = "sort_order")
    @Builder.Default
    private List<String> symbols = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() { createdAt = LocalDateTime.now(); }
}
