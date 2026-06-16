package com.tradingco.market.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CandleResponse(
        LocalDateTime openTime,
        BigDecimal open,
        BigDecimal high,
        BigDecimal low,
        BigDecimal close,
        Long volume
) {}
