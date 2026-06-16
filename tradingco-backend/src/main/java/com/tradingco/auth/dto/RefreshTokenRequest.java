package com.tradingco.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for refreshing an access token.
 *
 * @param refreshToken The refresh token to validate
 */
public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token is required")
        String refreshToken
) {
}
