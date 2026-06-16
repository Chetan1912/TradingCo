package com.tradingco.market.dto;

import java.math.BigDecimal;

public record QuoteResponse(
        String symbol,
        BigDecimal bid,
        BigDecimal ask,
        BigDecimal lastPrice,
        BigDecimal prevClose,
        BigDecimal openPrice,
        BigDecimal dayHigh,
        BigDecimal dayLow,
        Long volume,
        BigDecimal changeAmount,
        BigDecimal changePercent,
        String marketStatus
) {}
