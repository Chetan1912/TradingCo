package com.tradingco.account.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Request payload for creating a new paper-trading account.
 *
 * @param name           Account name
 * @param initialBalance Starting cash balance (minimum $1,000)
 */
public record CreateAccountRequest(
        @NotBlank(message = "Account name is required")
        String name,

        @NotNull(message = "Initial balance is required")
        @DecimalMin(value = "1000", message = "Initial balance must be at least $1,000")
        BigDecimal initialBalance
) {
}
