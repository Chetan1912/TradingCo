package com.tradingco.trading.dto;

import com.tradingco.trading.model.Position;
import com.tradingco.trading.model.Side;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PositionResponse(
        UUID id,
        UUID accountId,
        String symbol,
        Side side,
        Integer quantity,
        BigDecimal avgCost,
        BigDecimal currentPrice,
        BigDecimal marketValue,
        BigDecimal unrealizedPnl,
        BigDecimal unrealizedPnlPct,
        LocalDateTime openedAt
) {
    public static PositionResponse from(Position p) {
        return new PositionResponse(
                p.getId(), p.getAccountId(), p.getSymbol(), p.getSide(),
                p.getQuantity(), p.getAvgCost(), p.getCurrentPrice(),
                p.getMarketValue(), p.getUnrealizedPnl(), p.getUnrealizedPnlPct(),
                p.getOpenedAt()
        );
    }
}
