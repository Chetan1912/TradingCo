package com.tradingco.trading.dto;

import com.tradingco.trading.model.Trade;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record TradeResponse(
        UUID id,
        UUID accountId,
        String symbol,
        String side,
        Integer quantity,
        BigDecimal entryPrice,
        BigDecimal exitPrice,
        LocalDateTime entryTime,
        LocalDateTime exitTime,
        BigDecimal pnl,
        BigDecimal pnlPercent,
        BigDecimal commissionTotal
) {
    public static TradeResponse from(Trade t) {
        return new TradeResponse(
                t.getId(), t.getAccountId(), t.getSymbol(), t.getSide(),
                t.getQuantity(), t.getEntryPrice(), t.getExitPrice(),
                t.getEntryTime(), t.getExitTime(), t.getPnl(), t.getPnlPercent(),
                t.getCommissionTotal()
        );
    }
}
