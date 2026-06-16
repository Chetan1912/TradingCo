package com.tradingco.market.service;

import com.tradingco.market.dto.QuoteResponse;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

/**
 * Market screener — top gainers, losers, most active.
 */
@Service
@RequiredArgsConstructor
public class ScreenerService {

    private final QuoteRepository quoteRepository;

    public List<QuoteResponse> getTopGainers(int limit) {
        return quoteRepository.findAll().stream()
                .filter(q -> q.getChangePercent() != null)
                .sorted(Comparator.comparing(Quote::getChangePercent).reversed())
                .limit(limit)
                .map(this::toResponse)
                .toList();
    }

    public List<QuoteResponse> getTopLosers(int limit) {
        return quoteRepository.findAll().stream()
                .filter(q -> q.getChangePercent() != null)
                .sorted(Comparator.comparing(Quote::getChangePercent))
                .limit(limit)
                .map(this::toResponse)
                .toList();
    }

    public List<QuoteResponse> getMostActive(int limit) {
        return quoteRepository.findAll().stream()
                .filter(q -> q.getVolume() != null)
                .sorted(Comparator.comparing(Quote::getVolume).reversed())
                .limit(limit)
                .map(this::toResponse)
                .toList();
    }

    private QuoteResponse toResponse(Quote q) {
        return new QuoteResponse(q.getSymbol(), q.getBid(), q.getAsk(), q.getLastPrice(),
                q.getPrevClose(), q.getOpenPrice(), q.getDayHigh(), q.getDayLow(),
                q.getVolume(), q.getChangeAmount(), q.getChangePercent(), q.getMarketStatus());
    }
}
