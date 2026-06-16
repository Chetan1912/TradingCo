package com.tradingco.auth.service;

import com.tradingco.account.model.Account;
import com.tradingco.account.repository.AccountRepository;
import com.tradingco.auth.dto.*;
import com.tradingco.auth.model.ExperienceLevel;
import com.tradingco.auth.model.Role;
import com.tradingco.auth.model.User;
import com.tradingco.auth.repository.UserRepository;
import com.tradingco.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Authentication and user-management service.
 * Handles registration (with default account + watchlist creation),
 * login, token refresh, and profile operations.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    /**
     * Registers a new user, creates a default paper-trading account with the given
     * initial balance, and returns JWT tokens.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered: " + request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .experienceLevel(request.experienceLevel() != null
                        ? request.experienceLevel()
                        : ExperienceLevel.BEGINNER)
                .role(Role.USER)
                .build();

        user = userRepository.save(user);
        log.info("Registered new user: {} ({})", user.getDisplayName(), user.getEmail());

        // Create default trading account
        BigDecimal initialBalance = request.initialBalance() != null
                ? request.initialBalance()
                : new BigDecimal("100000.00");

        Account defaultAccount = Account.builder()
                .userId(user.getId())
                .name("Default Account")
                .initialBalance(initialBalance)
                .cashBalance(initialBalance)
                .currency("USD")
                .isActive(true)
                .build();
        accountRepository.save(defaultAccount);
        log.debug("Created default account for user {}", user.getId());

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole()
        );
    }

    /**
     * Authenticates a user by email/password and returns JWT tokens.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.email()));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        log.info("User logged in: {}", user.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken,
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole()
        );
    }

    /**
     * Validates a refresh token and issues a new access token.
     */
    public AuthResponse refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        String newAccessToken = jwtService.generateAccessToken(user);

        return new AuthResponse(
                newAccessToken,
                refreshToken,
                user.getId(),
                user.getDisplayName(),
                user.getEmail(),
                user.getRole()
        );
    }

    /**
     * Retrieves the profile of the currently authenticated user.
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        return toProfileResponse(user);
    }

    /**
     * Updates profile fields for the currently authenticated user.
     */
    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName());
        }
        if (request.experienceLevel() != null) {
            user.setExperienceLevel(request.experienceLevel());
        }
        if (request.timezone() != null && !request.timezone().isBlank()) {
            user.setTimezone(request.timezone());
        }
        if (request.uiTheme() != null && !request.uiTheme().isBlank()) {
            user.setUiTheme(request.uiTheme());
        }

        user = userRepository.save(user);
        log.debug("Updated profile for user {}", user.getId());

        return toProfileResponse(user);
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getExperienceLevel(),
                user.getRole(),
                user.getTimezone(),
                user.getUiTheme(),
                user.getCreatedAt()
        );
    }
}
