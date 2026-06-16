package com.tradingco.account.controller;

import com.tradingco.account.dto.AccountResponse;
import com.tradingco.account.dto.CreateAccountRequest;
import com.tradingco.account.service.AccountService;
import com.tradingco.auth.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for paper-trading account management.
 */
@RestController
@RequestMapping("/api/v1/accounts")
@RequiredArgsConstructor
@Tag(name = "Accounts", description = "Paper-trading account CRUD and balance management")
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @Operation(summary = "List all accounts for the current user")
    public ResponseEntity<List<AccountResponse>> listAccounts(
            @AuthenticationPrincipal User user) {
        List<AccountResponse> accounts = accountService.getAccounts(user.getId());
        return ResponseEntity.ok(accounts);
    }

    @PostMapping
    @Operation(summary = "Create a new paper-trading account")
    public ResponseEntity<AccountResponse> createAccount(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateAccountRequest request) {
        AccountResponse account = accountService.createAccount(
                user.getId(), request.name(), request.initialBalance());
        return ResponseEntity.status(HttpStatus.CREATED).body(account);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get account details by ID")
    public ResponseEntity<AccountResponse> getAccount(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        AccountResponse account = accountService.getAccount(id, user.getId());
        return ResponseEntity.ok(account);
    }

    @PostMapping("/{id}/reset")
    @Operation(summary = "Reset an account to its initial balance")
    public ResponseEntity<AccountResponse> resetAccount(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        AccountResponse account = accountService.resetAccount(id, user.getId());
        return ResponseEntity.ok(account);
    }
}
