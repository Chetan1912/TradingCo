package com.tradingco.market.controller;

import com.tradingco.market.dto.CandleResponse;
import com.tradingco.market.model.Candle;
import com.tradingco.market.repository.CandleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/candles")
@RequiredArgsConstructor
@Tag(name = "Candles", description = "OHLCV candlestick data")
public class CandleController {

    private final CandleRepository candleRepository;

    @GetMapping("/{symbol}")
    @Operation(summary = "Get candles for a symbol with timeframe and date range")
    public ResponseEntity<List<CandleResponse>> getCandles(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1D") String tf,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {

        LocalDateTime fromTime = from != null
                ? LocalDateTime.parse(from)
                : LocalDateTime.now().minusDays(tf.equals("1D") ? 365 : tf.equals("1h") ? 30 : 7);
        LocalDateTime toTime = to != null
                ? LocalDateTime.parse(to)
                : LocalDateTime.now();

        List<Candle> candles = candleRepository.findCandles(
                symbol.toUpperCase(), tf, fromTime, toTime);

        return ResponseEntity.ok(candles.stream()
                .map(c -> new CandleResponse(c.getOpenTime(), c.getOpen(),
                        c.getHigh(), c.getLow(), c.getClose(), c.getVolume()))
                .toList());
    }

    @GetMapping("/{symbol}/latest")
    @Operation(summary = "Get the latest N candles")
    public ResponseEntity<List<CandleResponse>> getLatestCandles(
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1D") String tf,
            @RequestParam(defaultValue = "100") int limit) {

        List<Candle> candles = candleRepository.findLatest(
                symbol.toUpperCase(), tf, Math.min(limit, 500));

        // Reverse to ascending order for chart rendering
        List<Candle> reversed = new java.util.ArrayList<>(candles);
        java.util.Collections.reverse(reversed);
        return ResponseEntity.ok(reversed.stream()
                .map(c -> new CandleResponse(c.getOpenTime(), c.getOpen(),
                        c.getHigh(), c.getLow(), c.getClose(), c.getVolume()))
                .toList());
    }
}
