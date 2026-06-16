package com.tradingco.analytics.controller;

import com.tradingco.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/{accountId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable UUID accountId) {
        return ResponseEntity.ok(analyticsService.getSummary(accountId));
    }

    @GetMapping("/{accountId}/equity-curve")
    public ResponseEntity<List<Map<String, Object>>> getEquityCurve(@PathVariable UUID accountId) {
        return ResponseEntity.ok(analyticsService.getEquityCurve(accountId));
    }
}
