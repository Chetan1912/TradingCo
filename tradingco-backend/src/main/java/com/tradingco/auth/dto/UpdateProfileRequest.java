package com.tradingco.auth.dto;

import com.tradingco.auth.model.ExperienceLevel;

/**
 * Request payload for updating the current user's profile.
 * All fields are optional — only non-null fields are applied.
 *
 * @param displayName     New display name
 * @param experienceLevel New experience level
 * @param timezone        New timezone
 * @param uiTheme         New UI theme
 */
public record UpdateProfileRequest(
        String displayName,
        ExperienceLevel experienceLevel,
        String timezone,
        String uiTheme
) {
}
