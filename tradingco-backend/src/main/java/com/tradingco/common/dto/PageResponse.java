package com.tradingco.common.dto;

import java.util.List;

/**
 * Generic paginated response wrapper.
 *
 * @param content       Items on the current page
 * @param page          Current page number (0-based)
 * @param size          Page size
 * @param totalElements Total number of items across all pages
 * @param totalPages    Total number of pages
 * @param <T>           Type of content items
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
