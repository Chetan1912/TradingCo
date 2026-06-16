package com.tradingco.account.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Account response DTO.
 *
 * @param id              Account UUID
 * @param name            Account name
 * @param initialBalance  Starting balance
 * @param cashBalance     Current cash available
 * @param currency        Currency code (e.g., USD)
 * @param isActive        Whether the account is active
 * @param createdAt       Creation timestamp
 */
public record AccountResponse(
        UUID id,
        String name,
        BigDecimal initialBalance,
        BigDecimal cashBalance,
        String currency,
        boolean isActive,
        LocalDateTime createdAt
) {
}
