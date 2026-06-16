package com.tradingco.market.controller;

import com.tradingco.market.dto.QuoteResponse;
import com.tradingco.market.service.ScreenerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/screener")
@RequiredArgsConstructor
public class ScreenerController {

    private final ScreenerService screenerService;

    @GetMapping("/gainers")
    public ResponseEntity<List<QuoteResponse>> topGainers(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(screenerService.getTopGainers(limit));
    }

    @GetMapping("/losers")
    public ResponseEntity<List<QuoteResponse>> topLosers(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(screenerService.getTopLosers(limit));
    }

    @GetMapping("/active")
    public ResponseEntity<List<QuoteResponse>> mostActive(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(screenerService.getMostActive(limit));
    }
}
