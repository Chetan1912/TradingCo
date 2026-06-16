package com.tradingco.common.dto;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standard error response body returned by the global exception handler.
 *
 * @param status      HTTP status code
 * @param message     Human-readable error message
 * @param error       Machine-readable error code
 * @param timestamp   When the error occurred
 * @param fieldErrors Per-field validation errors (nullable)
 */
public record ApiError(
        int status,
        String message,
        String error,
        LocalDateTime timestamp,
        Map<String, String> fieldErrors
) {
}
