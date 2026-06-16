package com.tradingco.trading.dto;

import com.tradingco.trading.model.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record OrderResponse(
        UUID id,
        UUID accountId,
        String symbol,
        Side side,
        OrderType orderType,
        OrderStatus status,
        Integer quantity,
        Integer filledQuantity,
        BigDecimal limitPrice,
        BigDecimal stopPrice,
        BigDecimal avgFillPrice,
        TimeInForce timeInForce,
        BigDecimal stopLoss,
        BigDecimal takeProfit,
        String rejectReason,
        LocalDateTime createdAt,
        LocalDateTime filledAt
) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId(), o.getAccountId(), o.getSymbol(), o.getSide(),
                o.getOrderType(), o.getStatus(), o.getQuantity(), o.getFilledQuantity(),
                o.getLimitPrice(), o.getStopPrice(), o.getAvgFillPrice(),
                o.getTimeInForce(), o.getStopLoss(), o.getTakeProfit(),
                o.getRejectReason(), o.getCreatedAt(), o.getFilledAt()
        );
    }
}
