package com.tradingco.auth.dto;

import com.tradingco.auth.model.Role;

import java.util.UUID;

/**
 * Authentication response containing JWT tokens and user summary.
 *
 * @param accessToken   Short-lived access token
 * @param refreshToken  Long-lived refresh token
 * @param userId        User UUID
 * @param displayName   User display name
 * @param email         User email
 * @param role          User role
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        UUID userId,
        String displayName,
        String email,
        Role role
) {
}
