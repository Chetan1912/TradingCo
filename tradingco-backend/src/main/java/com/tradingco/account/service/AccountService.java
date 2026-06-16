package com.tradingco.account.service;

import com.tradingco.account.dto.AccountResponse;
import com.tradingco.account.model.Account;
import com.tradingco.account.repository.AccountRepository;
import com.tradingco.common.exception.InsufficientFundsException;
import com.tradingco.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Service layer for paper-trading account management.
 * Handles creation, retrieval, balance updates, and account resets.
 */
@Service
@RequiredArgsConstructor
public class AccountService {

    private static final Logger log = LoggerFactory.getLogger(AccountService.class);

    private final AccountRepository accountRepository;

    /**
     * Creates a new paper-trading account for the given user.
     */
    @Transactional
    public AccountResponse createAccount(UUID userId, String name, BigDecimal initialBalance) {
        Account account = Account.builder()
                .userId(userId)
                .name(name)
                .initialBalance(initialBalance)
                .cashBalance(initialBalance)
                .currency("USD")
                .isActive(true)
                .build();

        account = accountRepository.save(account);
        log.info("Created account '{}' for user {} with balance ${}", name, userId, initialBalance);
        return toResponse(account);
    }

    /**
     * Returns all accounts belonging to the given user.
     */
    @Transactional(readOnly = true)
    public List<AccountResponse> getAccounts(UUID userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns a single account, ensuring it belongs to the given user.
     */
    @Transactional(readOnly = true)
    public AccountResponse getAccount(UUID accountId, UUID userId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));
        return toResponse(account);
    }

    /**
     * Resets an account back to its initial balance and marks it for position cleanup.
     */
    @Transactional
    public AccountResponse resetAccount(UUID accountId, UUID userId) {
        Account account = accountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        account.setCashBalance(account.getInitialBalance());
        account = accountRepository.save(account);
        log.info("Reset account {} to initial balance ${}", accountId, account.getInitialBalance());

        // TODO: Delete associated positions, orders, and trades when those modules are implemented

        return toResponse(account);
    }

    /**
     * Updates the account cash balance after an order fill.
     *
     * @param accountId Account UUID
     * @param side      "BUY" or "SELL"
     * @param quantity  Number of shares
     * @param price     Fill price per share
     */
    @Transactional
    public void updateBalance(UUID accountId, String side, int quantity, BigDecimal price) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        BigDecimal totalCost = price.multiply(BigDecimal.valueOf(quantity));

        if ("BUY".equalsIgnoreCase(side)) {
            if (account.getCashBalance().compareTo(totalCost) < 0) {
                throw new InsufficientFundsException(
                        String.format("Insufficient funds: need $%s but have $%s",
                                totalCost, account.getCashBalance()));
            }
            account.setCashBalance(account.getCashBalance().subtract(totalCost));
        } else {
            account.setCashBalance(account.getCashBalance().add(totalCost));
        }

        accountRepository.save(account);
        log.debug("Updated account {} balance: {} {} shares @ ${} → new balance ${}",
                accountId, side, quantity, price, account.getCashBalance());
    }

    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getName(),
                account.getInitialBalance(),
                account.getCashBalance(),
                account.getCurrency(),
                account.isActive(),
                account.getCreatedAt()
        );
    }
}
