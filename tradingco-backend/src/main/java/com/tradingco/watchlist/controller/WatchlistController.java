package com.tradingco.watchlist.controller;

import com.tradingco.watchlist.model.Watchlist;
import com.tradingco.watchlist.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/watchlists")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<Watchlist>> getWatchlists(@org.springframework.security.core.annotation.AuthenticationPrincipal com.tradingco.auth.model.User user) {
        return ResponseEntity.ok(watchlistService.getUserWatchlists(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Watchlist> create(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.tradingco.auth.model.User user,
            @RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "Watchlist");
        return ResponseEntity.status(HttpStatus.CREATED).body(watchlistService.create(user.getId(), name));
    }

    @PostMapping("/{id}/symbols")
    public ResponseEntity<Watchlist> addSymbol(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(watchlistService.addSymbol(id, body.get("symbol")));
    }

    @DeleteMapping("/{id}/symbols/{symbol}")
    public ResponseEntity<Watchlist> removeSymbol(@PathVariable UUID id, @PathVariable String symbol) {
        return ResponseEntity.ok(watchlistService.removeSymbol(id, symbol));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        watchlistService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
