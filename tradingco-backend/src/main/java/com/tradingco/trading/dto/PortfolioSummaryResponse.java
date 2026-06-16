package com.tradingco.trading.dto;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioSummaryResponse(
        BigDecimal totalEquity,
        BigDecimal cashBalance,
        BigDecimal positionsValue,
        BigDecimal unrealizedPnl,
        BigDecimal unrealizedPnlPct,
        BigDecimal dayPnl,
        BigDecimal dayPnlPct,
        int totalPositions,
        int totalTrades,
        List<PositionResponse> positions
) {}
