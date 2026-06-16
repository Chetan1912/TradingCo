package com.tradingco.market.engine;

import com.tradingco.market.model.Candle;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.CandleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Aggregates price ticks into OHLCV candles at multiple timeframes.
 * Maintains in-memory current candle and flushes to DB when a period closes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CandleAggregator {

    private final CandleRepository candleRepository;

    // Current open candle per symbol+timeframe
    private final ConcurrentHashMap<String, Candle> currentCandles = new ConcurrentHashMap<>();

    private static final String[] TIMEFRAMES = {"1m", "5m", "15m", "1h", "1D"};

    /**
     * Process a price tick and update all timeframe candles.
     */
    public void processTick(Quote quote) {
        String symbol = quote.getSymbol();
        BigDecimal price = quote.getLastPrice();
        long volume = 500L; // approximate volume per tick

        for (String tf : TIMEFRAMES) {
            String key = symbol + ":" + tf;
            LocalDateTime candleOpen = alignToTimeframe(LocalDateTime.now(), tf);

            Candle candle = currentCandles.get(key);

            if (candle == null || !candle.getOpenTime().equals(candleOpen)) {
                // Flush previous candle if exists
                if (candle != null) {
                    try {
                        candleRepository.save(candle);
                    } catch (Exception e) {
                        log.debug("Candle already exists: {} {}", symbol, tf);
                    }
                }
                // Start new candle
                candle = Candle.builder()
                        .symbol(symbol)
                        .timeframe(tf)
                        .openTime(candleOpen)
                        .open(price)
                        .high(price)
                        .low(price)
                        .close(price)
                        .volume(volume)
                        .build();
                currentCandles.put(key, candle);
            } else {
                // Update existing candle
                if (price.compareTo(candle.getHigh()) > 0) candle.setHigh(price);
                if (price.compareTo(candle.getLow()) < 0) candle.setLow(price);
                candle.setClose(price);
                candle.setVolume(candle.getVolume() + volume);
            }
        }
    }

    /**
     * Flush all current candles to the database.
     */
    public void flushAll() {
        currentCandles.values().forEach(candle -> {
            try {
                candleRepository.save(candle);
            } catch (Exception e) {
                log.debug("Flush conflict for {} {}", candle.getSymbol(), candle.getTimeframe());
            }
        });
    }

    /**
     * Generate historical candles for a symbol (for demo/backfill).
     * Creates 100 candles of the specified timeframe going back from now.
     */
    public void generateHistory(String symbol, BigDecimal startPrice, String timeframe, int count) {
        BigDecimal price = startPrice;
        java.util.Random rng = new java.util.Random(symbol.hashCode());
        List<Candle> candles = new java.util.ArrayList<>();

        LocalDateTime now = alignToTimeframe(LocalDateTime.now(), timeframe);
        long minutesPerCandle = getMinutesForTimeframe(timeframe);

        for (int i = count; i > 0; i--) {
            LocalDateTime openTime = now.minusMinutes(minutesPerCandle * i);

            // Random OHLC
            double change = (rng.nextGaussian() * 0.015); // ~1.5% std dev per candle
            BigDecimal open = price;
            BigDecimal close = price.multiply(BigDecimal.valueOf(1 + change))
                    .setScale(2, java.math.RoundingMode.HALF_UP);

            BigDecimal high = open.max(close).multiply(BigDecimal.valueOf(1 + Math.abs(rng.nextGaussian() * 0.005)))
                    .setScale(2, java.math.RoundingMode.HALF_UP);
            BigDecimal low = open.min(close).multiply(BigDecimal.valueOf(1 - Math.abs(rng.nextGaussian() * 0.005)))
                    .setScale(2, java.math.RoundingMode.HALF_UP);

            long vol = (long) (Math.abs(rng.nextGaussian()) * 500000 + 100000);

            candles.add(Candle.builder()
                    .symbol(symbol)
                    .timeframe(timeframe)
                    .openTime(openTime)
                    .open(open)
                    .high(high)
                    .low(low)
                    .close(close)
                    .volume(vol)
                    .build());

            price = close;
        }

        candleRepository.saveAll(candles);
        log.info("Generated {} {} candles for {}", count, timeframe, symbol);
    }

    // ── Helpers ───────────────────────────────────────────────────

    private LocalDateTime alignToTimeframe(LocalDateTime dt, String tf) {
        return switch (tf) {
            case "1m" -> dt.truncatedTo(ChronoUnit.MINUTES);
            case "5m" -> dt.withMinute(dt.getMinute() / 5 * 5).withSecond(0).withNano(0);
            case "15m" -> dt.withMinute(dt.getMinute() / 15 * 15).withSecond(0).withNano(0);
            case "30m" -> dt.withMinute(dt.getMinute() / 30 * 30).withSecond(0).withNano(0);
            case "1h" -> dt.truncatedTo(ChronoUnit.HOURS);
            case "4h" -> dt.withHour(dt.getHour() / 4 * 4).truncatedTo(ChronoUnit.HOURS);
            case "1D" -> dt.toLocalDate().atStartOfDay();
            default -> dt.truncatedTo(ChronoUnit.MINUTES);
        };
    }

    private long getMinutesForTimeframe(String tf) {
        return switch (tf) {
            case "1m" -> 1;
            case "5m" -> 5;
            case "15m" -> 15;
            case "30m" -> 30;
            case "1h" -> 60;
            case "4h" -> 240;
            case "1D" -> 1440;
            default -> 1;
        };
    }
}
