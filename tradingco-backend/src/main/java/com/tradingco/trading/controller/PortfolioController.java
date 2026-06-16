package com.tradingco.trading.controller;

import com.tradingco.trading.dto.*;
import com.tradingco.trading.service.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "Portfolio summary, positions, and trade history")
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping("/{accountId}")
    @Operation(summary = "Get portfolio summary")
    public ResponseEntity<PortfolioSummaryResponse> getPortfolio(@PathVariable UUID accountId) {
        return ResponseEntity.ok(portfolioService.getPortfolioSummary(accountId));
    }

    @GetMapping("/{accountId}/positions")
    @Operation(summary = "Get all open positions")
    public ResponseEntity<List<PositionResponse>> getPositions(@PathVariable UUID accountId) {
        return ResponseEntity.ok(portfolioService.getPositions(accountId));
    }

    @GetMapping("/{accountId}/history")
    @Operation(summary = "Get closed trade history")
    public ResponseEntity<List<TradeResponse>> getTradeHistory(@PathVariable UUID accountId) {
        return ResponseEntity.ok(portfolioService.getTradeHistory(accountId));
    }
}
