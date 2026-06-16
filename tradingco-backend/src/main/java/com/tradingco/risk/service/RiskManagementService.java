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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskManagementService {

    private final TradeRepository tradeRepository;
    private final PositionRepository positionRepository;
    private final QuoteRepository quoteRepository;

    private static final double MAX_DAILY_LOSS_PCT = 5.0; // 5%
    private static final double MAX_POSITION_PCT = 25.0;  // 25%
    private static final int MAX_OPEN_POSITIONS = 20;
    private static final int MAX_TRADES_PER_DAY = 25;

    public RiskCheckResult checkOrder(Order order, Account account) {
        List<String> warnings = new ArrayList<>();
        List<String> blocks = new ArrayList<>();

        // Get latest asset price
        BigDecimal lastPrice = BigDecimal.ZERO;
        Optional<Quote> quoteOpt = quoteRepository.findBySymbol(order.getSymbol());
        if (quoteOpt.isPresent()) {
            lastPrice = quoteOpt.get().getLastPrice();
        }

        // Calculate account equity
        List<Position> positions = positionRepository.findByAccountId(account.getId());
        BigDecimal positionsValue = positions.stream()
                .map(Position::getMarketValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalEquity = account.getCashBalance().add(positionsValue);

        // Rule 1: Daily Loss Limit (closed P&L + open unrealized P&L)
        BigDecimal dailyClosedPnl = getDailyClosedPnl(account.getId());
        BigDecimal openUnrealizedPnl = positions.stream()
                .map(Position::getUnrealizedPnl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalDailyPnl = dailyClosedPnl.add(openUnrealizedPnl);

        if (account.getInitialBalance().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal dailyLossPct = totalDailyPnl.divide(account.getInitialBalance(), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
            
            // e.g. -5.2% vs -5.0%
            if (dailyLossPct.compareTo(BigDecimal.valueOf(-MAX_DAILY_LOSS_PCT)) <= 0) {
                blocks.add(String.format("Daily loss limit of %.1f%% reached. Current daily P&L: %s (%.2f%%)",
                        MAX_DAILY_LOSS_PCT, totalDailyPnl, dailyLossPct));
            }
        }

        // Rule 2: Open Positions Limit
        if (order.getSide() == Side.BUY) {
            // Check if user already holds it
            boolean alreadyHolds = positions.stream().anyMatch(p -> p.getSymbol().equalsIgnoreCase(order.getSymbol()));
            if (!alreadyHolds && positions.size() >= MAX_OPEN_POSITIONS) {
                blocks.add(String.format("Maximum of %d open positions reached.", MAX_OPEN_POSITIONS));
            }
        }

        // Rule 3: Position Concentration
        if (order.getSide() == Side.BUY && lastPrice.compareTo(BigDecimal.ZERO) > 0 && totalEquity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal orderValue = lastPrice.multiply(BigDecimal.valueOf(order.getQuantity()));
            BigDecimal concentration = orderValue.divide(totalEquity, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            if (concentration.compareTo(BigDecimal.valueOf(MAX_POSITION_PCT)) > 0) {
                warnings.add(String.format("Concentration risk: Position would represent %.1f%% of total portfolio equity (Max recommended: %.1f%%).",
                        concentration, MAX_POSITION_PCT));
            }
        }

        // Rule 4: No Stop-Loss Warning
        if (order.getSide() == Side.BUY && order.getStopLoss() == null) {
            warnings.add("Pre-trade advisory: Order does not specify a stop-loss. Consider setting one to protect your capital.");
        }

        // Rule 5: Overtrading Check
        int tradesToday = getTodayTradesCount(account.getId());
        if (tradesToday >= MAX_TRADES_PER_DAY) {
            warnings.add(String.format("Advisory: You have executed %d trades today. High trading frequency flags risk of overtrading.", tradesToday));
        }

        return new RiskCheckResult(warnings, blocks);
    }

    private BigDecimal getDailyClosedPnl(UUID accountId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<Trade> trades = tradeRepository.findByAccountIdOrderByExitTimeDesc(accountId);
        return trades.stream()
                .filter(t -> t.getExitTime().isAfter(startOfDay))
                .map(Trade::getPnl)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int getTodayTradesCount(UUID accountId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        List<Trade> trades = tradeRepository.findByAccountIdOrderByExitTimeDesc(accountId);
        return (int) trades.stream()
                .filter(t -> t.getExitTime().isAfter(startOfDay))
                .count();
    }
}
