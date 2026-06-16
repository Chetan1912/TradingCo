package com.tradingco.market.engine;

import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PriceSimulationEngineTest {

    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private PriceSimulationEngine priceSimulationEngine;

    private Quote testQuote;

    @BeforeEach
    void setUp() {
        testQuote = new Quote();
        testQuote.setSymbol("AAPL");
        testQuote.setLastPrice(BigDecimal.valueOf(150.00));
        testQuote.setPrevClose(BigDecimal.valueOf(148.00));
        testQuote.setBid(BigDecimal.valueOf(149.95));
        testQuote.setAsk(BigDecimal.valueOf(150.05));
        testQuote.setDayHigh(BigDecimal.valueOf(152.00));
        testQuote.setDayLow(BigDecimal.valueOf(147.00));
        testQuote.setVolume(10000L);
    }

    @Test
    void testInitialize() {
        when(quoteRepository.findAll()).thenReturn(List.of(testQuote));

        priceSimulationEngine.initialize();

        assertTrue(priceSimulationEngine.isRunning());
        double vol = priceSimulationEngine.getVolatility("AAPL");
        assertTrue(vol > 0.0);
    }

    @Test
    void testTickUpdatesQuote() {
        when(quoteRepository.findAll()).thenReturn(List.of(testQuote));
        priceSimulationEngine.initialize();

        BigDecimal originalPrice = testQuote.getLastPrice();
        Quote updatedQuote = priceSimulationEngine.tick(testQuote);

        assertNotNull(updatedQuote);
        assertNotEquals(originalPrice, updatedQuote.getLastPrice());
        assertNotNull(updatedQuote.getBid());
        assertNotNull(updatedQuote.getAsk());
        assertTrue(updatedQuote.getVolume() > 10000L);
        assertEquals("REGULAR", updatedQuote.getMarketStatus());
    }

    @Test
    void testTickAllNotRunning() {
        List<Quote> quotes = priceSimulationEngine.tickAll();
        assertTrue(quotes.isEmpty());
    }
}
