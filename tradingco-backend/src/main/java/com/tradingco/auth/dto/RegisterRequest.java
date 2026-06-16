package com.tradingco.auth.dto;

import com.tradingco.auth.model.ExperienceLevel;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Registration request payload.
 *
 * @param email            User email (must be unique)
 * @param password         Password (min 8 chars)
 * @param displayName      Display name
 * @param experienceLevel  Optional trading experience (defaults to BEGINNER)
 * @param initialBalance   Optional starting balance (defaults to $100,000)
 */
public record RegisterRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters")
        String password,

        @NotBlank(message = "Display name is required")
        String displayName,

        ExperienceLevel experienceLevel,

        @DecimalMin(value = "1000", message = "Initial balance must be at least 1000")
        BigDecimal initialBalance
) {
}
