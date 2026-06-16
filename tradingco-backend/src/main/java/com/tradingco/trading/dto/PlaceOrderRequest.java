package com.tradingco.trading.dto;

import com.tradingco.trading.model.OrderType;
import com.tradingco.trading.model.Side;
import com.tradingco.trading.model.TimeInForce;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

public record PlaceOrderRequest(
        @NotNull UUID accountId,
        @NotBlank String symbol,
        @NotNull Side side,
        @NotNull OrderType orderType,
        @NotNull @Min(1) @Max(100000) Integer quantity,
        BigDecimal limitPrice,
        BigDecimal stopPrice,
        TimeInForce timeInForce,
        BigDecimal stopLoss,
        BigDecimal takeProfit
) {}
