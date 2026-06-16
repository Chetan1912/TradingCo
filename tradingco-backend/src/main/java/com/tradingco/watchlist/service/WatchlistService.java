package com.tradingco.watchlist.service;

import com.tradingco.common.exception.ResourceNotFoundException;
import com.tradingco.watchlist.model.Watchlist;
import com.tradingco.watchlist.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    public List<Watchlist> getUserWatchlists(UUID userId) {
        return watchlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Watchlist create(UUID userId, String name) {
        boolean isDefault = watchlistRepository.countByUserId(userId) == 0;
        Watchlist wl = Watchlist.builder()
                .userId(userId).name(name).isDefault(isDefault).build();
        return watchlistRepository.save(wl);
    }

    @Transactional
    public Watchlist addSymbol(UUID watchlistId, String symbol) {
        Watchlist wl = findById(watchlistId);
        if (!wl.getSymbols().contains(symbol.toUpperCase())) {
            wl.getSymbols().add(symbol.toUpperCase());
            watchlistRepository.save(wl);
        }
        return wl;
    }

    @Transactional
    public Watchlist removeSymbol(UUID watchlistId, String symbol) {
        Watchlist wl = findById(watchlistId);
        wl.getSymbols().remove(symbol.toUpperCase());
        watchlistRepository.save(wl);
        return wl;
    }

    @Transactional
    public void delete(UUID watchlistId) {
        watchlistRepository.deleteById(watchlistId);
    }

    private Watchlist findById(UUID id) {
        return watchlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist", "id", id.toString()));
    }
}
