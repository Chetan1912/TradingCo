package com.tradingco.common.exception;

/**
 * Thrown when an order fails validation rules (invalid quantity, price, side, etc.).
 */
public class OrderValidationException extends RuntimeException {

    public OrderValidationException(String message) {
        super(message);
    }
}
