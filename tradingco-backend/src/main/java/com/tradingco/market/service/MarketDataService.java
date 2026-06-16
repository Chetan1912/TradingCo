package com.tradingco.market.service;

import com.tradingco.market.engine.CandleAggregator;
import com.tradingco.market.engine.PriceSimulationEngine;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;

/**
 * Orchestrates the market data pipeline:
 * 1. PriceSimulationEngine generates ticks
 * 2. CandleAggregator builds candles
 * 3. WebSocket broadcasts to subscribed clients
 *
 * Runs on a 2-second tick cycle during "market hours" (always on for demo).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MarketDataService {

    private final PriceSimulationEngine priceEngine;
    private final CandleAggregator candleAggregator;
    private final QuoteRepository quoteRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final com.tradingco.trading.service.OrderExecutionService orderExecutionService;
    private final com.tradingco.alert.service.AlertService alertService;

    @PostConstruct
    public void init() {
        priceEngine.initialize();
        log.info("Market data pipeline started");
    }

    /**
     * Main tick loop — runs every 2 seconds.
     * Generates prices, aggregates candles, broadcasts via WebSocket.
     */
    @Scheduled(fixedRate = 2000)
    public void tickCycle() {
        if (!priceEngine.isRunning()) return;

        try {
            List<Quote> updatedQuotes = priceEngine.tickAll();

            // Aggregate into candles
            for (Quote q : updatedQuotes) {
                candleAggregator.processTick(q);
            }

            // Broadcast each quote via WebSocket
            for (Quote q : updatedQuotes) {
                QuoteTick tick = new QuoteTick(
                        q.getSymbol(),
                        q.getLastPrice(),
                        q.getBid(),
                        q.getAsk(),
                        q.getChangeAmount(),
                        q.getChangePercent(),
                        q.getVolume(),
                        q.getDayHigh(),
                        q.getDayLow()
                );
                messagingTemplate.convertAndSend("/topic/prices/" + q.getSymbol(), tick);
            }

            // Broadcast batch update for dashboard
            messagingTemplate.convertAndSend("/topic/prices/all", updatedQuotes.stream()
                    .map(q -> new QuoteTick(q.getSymbol(), q.getLastPrice(), q.getBid(), q.getAsk(),
                            q.getChangeAmount(), q.getChangePercent(), q.getVolume(), q.getDayHigh(), q.getDayLow()))
                    .toList());

            // Process pending limit/stop orders against the new prices
            orderExecutionService.checkPendingOrders();

            // Evaluate active price alerts
            alertService.checkAlerts(updatedQuotes);

        } catch (Exception e) {
            log.error("Tick cycle error", e);
        }
    }

    /**
     * Flush candles to DB every minute.
     */
    @Scheduled(fixedRate = 60000)
    public void flushCandles() {
        candleAggregator.flushAll();
    }

    // Compact DTO for WebSocket broadcast
    public record QuoteTick(
            String symbol,
            java.math.BigDecimal last,
            java.math.BigDecimal bid,
            java.math.BigDecimal ask,
            java.math.BigDecimal change,
            java.math.BigDecimal changePct,
            Long volume,
            java.math.BigDecimal dayHigh,
            java.math.BigDecimal dayLow
    ) {}
}
