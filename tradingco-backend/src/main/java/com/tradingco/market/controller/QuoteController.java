package com.tradingco.market.controller;

import com.tradingco.common.exception.ResourceNotFoundException;
import com.tradingco.market.dto.QuoteResponse;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/quotes")
@RequiredArgsConstructor
@Tag(name = "Quotes", description = "Real-time quote data")
public class QuoteController {

    private final QuoteRepository quoteRepository;

    @GetMapping("/{symbol}")
    @Operation(summary = "Get latest quote for a symbol")
    public ResponseEntity<QuoteResponse> getQuote(@PathVariable String symbol) {
        Quote q = quoteRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "symbol", symbol));
        return ResponseEntity.ok(toResponse(q));
    }

    @GetMapping("/batch")
    @Operation(summary = "Get quotes for multiple symbols")
    public ResponseEntity<List<QuoteResponse>> getBatchQuotes(@RequestParam String symbols) {
        List<String> symbolList = Arrays.stream(symbols.split(","))
                .map(String::trim).map(String::toUpperCase).toList();
        List<Quote> quotes = quoteRepository.findBySymbolIn(symbolList);
        return ResponseEntity.ok(quotes.stream().map(this::toResponse).toList());
    }

    @GetMapping
    @Operation(summary = "Get all quotes")
    public ResponseEntity<List<QuoteResponse>> getAllQuotes() {
        List<Quote> quotes = quoteRepository.findAll();
        return ResponseEntity.ok(quotes.stream().map(this::toResponse).toList());
    }

    private QuoteResponse toResponse(Quote q) {
        return new QuoteResponse(
                q.getSymbol(), q.getBid(), q.getAsk(), q.getLastPrice(),
                q.getPrevClose(), q.getOpenPrice(), q.getDayHigh(), q.getDayLow(),
                q.getVolume(), q.getChangeAmount(), q.getChangePercent(), q.getMarketStatus()
        );
    }
}
