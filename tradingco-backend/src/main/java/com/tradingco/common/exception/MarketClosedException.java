package com.tradingco.common.exception;

/**
 * Thrown when an order is placed while the market is closed.
 */
public class MarketClosedException extends RuntimeException {

    public MarketClosedException(String message) {
        super(message);
    }
}
