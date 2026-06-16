package com.tradingco.market.engine;

import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Price Simulation Engine using Geometric Brownian Motion (GBM)
 * with mean-reversion and intraday volatility patterns.
 *
 * Simulates realistic price movements for all tradeable assets.
 * Each tick: δS/S = μ·δt + σ·√δt·Z  (where Z ~ N(0,1))
 * Plus a mean-reversion term pulling price toward the equilibrium (prev_close).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PriceSimulationEngine {

    private final QuoteRepository quoteRepository;

    private final Random random = new Random();
    private final ConcurrentHashMap<String, SimState> states = new ConcurrentHashMap<>();
    private volatile boolean running = false;

    // ── Simulation Parameters ──────────────────────────────────────
    /** Base annual drift (0 = mean-reverting market) */
    private static final double MU = 0.0;
    /** Mean-reversion speed (higher = faster pull to equilibrium) */
    private static final double KAPPA = 0.003;
    /** Tick interval in seconds */
    private static final double DT = 2.0;
    /** Annualized to per-tick factor: √(dt / (252 * 6.5 * 3600)) */
    private static final double SQRT_DT = Math.sqrt(DT / (252.0 * 6.5 * 3600.0));
    /** Bid/ask spread as fraction of price */
    private static final double SPREAD_BPS = 0.0003; // ~3 bps

    /**
     * Per-symbol simulation state holding volatility and equilibrium.
     */
    private record SimState(double baseVolatility, double equilibriumPrice) {}

    /**
     * Initialize engine: load all quotes, compute per-symbol parameters.
     */
    public void initialize() {
        List<Quote> allQuotes = quoteRepository.findAll();
        for (Quote q : allQuotes) {
            double vol = computeVolatility(q);
            double eq = q.getPrevClose() != null
                    ? q.getPrevClose().doubleValue()
                    : q.getLastPrice().doubleValue();
            states.put(q.getSymbol(), new SimState(vol, eq));
        }
        running = true;
        log.info("PriceSimulationEngine initialized with {} symbols", states.size());
    }

    /**
     * Stop the simulation engine.
     */
    public void stop() {
        running = false;
        log.info("PriceSimulationEngine stopped");
    }

    public boolean isRunning() {
        return running;
    }

    /**
     * Generate next tick for a single symbol.
     * Returns the updated Quote, or null if symbol not tracked.
     */
    public Quote tick(Quote quote) {
        SimState state = states.get(quote.getSymbol());
        if (state == null) return quote;

        double price = quote.getLastPrice().doubleValue();
        double sigma = state.baseVolatility();
        double eqPrice = state.equilibriumPrice();

        // ── GBM with mean-reversion ──
        double z = random.nextGaussian();
        double drift = MU * DT / (252.0 * 6.5 * 3600.0);
        double diffusion = sigma * SQRT_DT * z;
        double meanReversion = -KAPPA * (price - eqPrice) / eqPrice;

        double returnPct = drift + diffusion + meanReversion;
        double newPrice = price * (1.0 + returnPct);

        // Clamp to prevent absurd moves (±5% per tick = circuit breaker)
        double maxMove = price * 0.05;
        newPrice = Math.max(price - maxMove, Math.min(price + maxMove, newPrice));
        newPrice = Math.max(0.01, newPrice); // floor at 1 cent

        BigDecimal lastPrice = BigDecimal.valueOf(newPrice).setScale(2, RoundingMode.HALF_UP);

        // ── Bid/Ask spread ──
        double halfSpread = newPrice * SPREAD_BPS;
        BigDecimal bid = BigDecimal.valueOf(newPrice - halfSpread).setScale(2, RoundingMode.HALF_UP);
        BigDecimal ask = BigDecimal.valueOf(newPrice + halfSpread).setScale(2, RoundingMode.HALF_UP);

        // ── Update day high/low ──
        BigDecimal dayHigh = quote.getDayHigh();
        BigDecimal dayLow = quote.getDayLow();
        if (dayHigh == null || lastPrice.compareTo(dayHigh) > 0) dayHigh = lastPrice;
        if (dayLow == null || lastPrice.compareTo(dayLow) < 0) dayLow = lastPrice;

        // ── Volume tick (random realistic volume per tick) ──
        long volumeTick = (long) (Math.abs(random.nextGaussian()) * 1000 + 500);
        long totalVolume = (quote.getVolume() != null ? quote.getVolume() : 0L) + volumeTick;

        // ── Apply updates ──
        quote.setBid(bid);
        quote.setAsk(ask);
        quote.setLastPrice(lastPrice);
        quote.setDayHigh(dayHigh);
        quote.setDayLow(dayLow);
        quote.setVolume(totalVolume);
        quote.setMarketStatus("REGULAR");
        quote.recalculate();

        return quote;
    }

    /**
     * Tick ALL tracked symbols. Called by the scheduler.
     */
    public List<Quote> tickAll() {
        if (!running) return List.of();

        List<Quote> allQuotes = quoteRepository.findAll();
        for (Quote q : allQuotes) {
            tick(q);
        }
        quoteRepository.saveAll(allQuotes);
        return allQuotes;
    }

    /**
     * Compute annualized volatility based on the asset's beta.
     * Market vol ≈ 16%, stock vol = beta × market vol + idiosyncratic.
     */
    private double computeVolatility(Quote quote) {
        // Default market volatility ~16% annualized
        double marketVol = 0.16;
        // We don't have beta on Quote, use a default of 1.0
        // In production, you'd join with Asset table for beta
        double beta = 1.0;
        double idiosyncratic = 0.05 + random.nextDouble() * 0.10; // 5-15%
        return beta * marketVol + idiosyncratic;
    }

    /**
     * Get the simulated volatility for a symbol.
     */
    public double getVolatility(String symbol) {
        SimState state = states.get(symbol);
        return state != null ? state.baseVolatility() : 0.20;
    }
}
