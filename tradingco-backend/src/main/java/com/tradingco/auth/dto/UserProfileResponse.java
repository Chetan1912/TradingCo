package com.tradingco.auth.dto;

import com.tradingco.auth.model.ExperienceLevel;
import com.tradingco.auth.model.Role;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User profile response DTO.
 *
 * @param id              User UUID
 * @param email           Email address
 * @param displayName     Display name
 * @param experienceLevel Trading experience level
 * @param role            User role
 * @param timezone        Preferred timezone
 * @param uiTheme         UI theme preference
 * @param createdAt       Account creation timestamp
 */
public record UserProfileResponse(
        UUID id,
        String email,
        String displayName,
        ExperienceLevel experienceLevel,
        Role role,
        String timezone,
        String uiTheme,
        LocalDateTime createdAt
) {
}
