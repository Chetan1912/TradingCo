package com.tradingco.market.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record AssetResponse(
        UUID id,
        String symbol,
        String name,
        String assetType,
        String exchange,
        String sector,
        String industry,
        Long marketCap,
        BigDecimal peRatio,
        BigDecimal eps,
        BigDecimal dividendYield,
        BigDecimal beta,
        BigDecimal high52w,
        BigDecimal low52w,
        Long avgVolume,
        // Latest quote data (joined)
        BigDecimal lastPrice,
        BigDecimal changeAmount,
        BigDecimal changePercent,
        Long volume
) {}
