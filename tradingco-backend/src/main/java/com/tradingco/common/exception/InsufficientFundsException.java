package com.tradingco.common.exception;

/**
 * Thrown when a trading operation requires more funds than available in the account.
 */
public class InsufficientFundsException extends RuntimeException {

    public InsufficientFundsException(String message) {
        super(message);
    }
}
