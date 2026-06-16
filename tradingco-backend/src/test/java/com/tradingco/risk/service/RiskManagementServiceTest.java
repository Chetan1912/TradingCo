package com.tradingco.risk.service;

import com.tradingco.account.model.Account;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import com.tradingco.risk.dto.RiskCheckResult;
import com.tradingco.trading.model.Order;
import com.tradingco.trading.model.Position;
import com.tradingco.trading.model.Side;
import com.tradingco.trading.model.Trade;
import com.tradingco.trading.repository.PositionRepository;
import com.tradingco.trading.repository.TradeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RiskManagementServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private PositionRepository positionRepository;

    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private RiskManagementService riskManagementService;

    private Account testAccount;
    private Order testOrder;
    private Quote testQuote;

    @BeforeEach
    void setUp() {
        UUID accountId = UUID.randomUUID();
        
        testAccount = new Account();
        testAccount.setId(accountId);
        testAccount.setInitialBalance(BigDecimal.valueOf(100000.00));
        testAccount.setCashBalance(BigDecimal.valueOf(100000.00));

        testOrder = new Order();
        testOrder.setSymbol("AAPL");
        testOrder.setSide(Side.BUY);
        testOrder.setQuantity(100);
        testOrder.setStopLoss(BigDecimal.valueOf(140.00));

        testQuote = new Quote();
        testQuote.setSymbol("AAPL");
        testQuote.setLastPrice(BigDecimal.valueOf(150.00));
    }

    @Test
    void testCheckOrderNoRisk() {
        when(quoteRepository.findBySymbol("AAPL")).thenReturn(Optional.of(testQuote));
        when(positionRepository.findByAccountId(testAccount.getId())).thenReturn(List.of());
        when(tradeRepository.findByAccountIdOrderByExitTimeDesc(testAccount.getId())).thenReturn(List.of());

        RiskCheckResult result = riskManagementService.checkOrder(testOrder, testAccount);

        assertTrue(result.warnings().isEmpty());
        assertTrue(result.blocks().isEmpty());
    }

    @Test
    void testCheckOrderMissingStopLossWarning() {
        testOrder.setStopLoss(null);
        when(quoteRepository.findBySymbol("AAPL")).thenReturn(Optional.of(testQuote));
        when(positionRepository.findByAccountId(testAccount.getId())).thenReturn(List.of());
        when(tradeRepository.findByAccountIdOrderByExitTimeDesc(testAccount.getId())).thenReturn(List.of());

        RiskCheckResult result = riskManagementService.checkOrder(testOrder, testAccount);

        assertEquals(1, result.warnings().size());
        assertTrue(result.warnings().get(0).contains("stop-loss"));
        assertTrue(result.blocks().isEmpty());
    }

    @Test
    void testCheckOrderConcentrationRiskWarning() {
        // Order value: 150 * 200 = 30000 (which is 30% of totalEquity 100000, > 25% threshold)
        testOrder.setQuantity(200);
        when(quoteRepository.findBySymbol("AAPL")).thenReturn(Optional.of(testQuote));
        when(positionRepository.findByAccountId(testAccount.getId())).thenReturn(List.of());
        when(tradeRepository.findByAccountIdOrderByExitTimeDesc(testAccount.getId())).thenReturn(List.of());

        RiskCheckResult result = riskManagementService.checkOrder(testOrder, testAccount);

        assertEquals(1, result.warnings().size());
        assertTrue(result.warnings().get(0).contains("Concentration risk"));
        assertTrue(result.blocks().isEmpty());
    }

    @Test
    void testCheckOrderDailyLossLimitReached() {
        // Daily P&L is negative (closed loss + open unrealized loss)
        // Closed P&L: -6000, open unrealized P&L: -1000, total daily P&L: -7000 (7% loss of 100000 initial balance, > 5%)
        Trade closedLossTrade = new Trade();
        closedLossTrade.setPnl(BigDecimal.valueOf(-6000.00));
        closedLossTrade.setExitTime(LocalDateTime.now());

        Position openLossPosition = new Position();
        openLossPosition.setSymbol("MSFT");
        openLossPosition.setUnrealizedPnl(BigDecimal.valueOf(-1000.00));
        openLossPosition.setMarketValue(BigDecimal.valueOf(10000.00));

        when(quoteRepository.findBySymbol("AAPL")).thenReturn(Optional.of(testQuote));
        when(positionRepository.findByAccountId(testAccount.getId())).thenReturn(List.of(openLossPosition));
        when(tradeRepository.findByAccountIdOrderByExitTimeDesc(testAccount.getId())).thenReturn(List.of(closedLossTrade));

        RiskCheckResult result = riskManagementService.checkOrder(testOrder, testAccount);

        assertEquals(1, result.blocks().size());
        assertTrue(result.blocks().get(0).contains("Daily loss limit"));
    }
}
