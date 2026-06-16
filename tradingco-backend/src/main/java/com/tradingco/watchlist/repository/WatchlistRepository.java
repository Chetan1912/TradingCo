package com.tradingco.watchlist.repository;

import com.tradingco.watchlist.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WatchlistRepository extends JpaRepository<Watchlist, UUID> {
    List<Watchlist> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserId(UUID userId);
}
