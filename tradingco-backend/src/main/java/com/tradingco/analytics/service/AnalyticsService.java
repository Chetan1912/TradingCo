package com.tradingco.analytics.service;

import com.tradingco.account.model.Account;
import com.tradingco.account.repository.AccountRepository;
import com.tradingco.common.exception.ResourceNotFoundException;
import com.tradingco.trading.model.Trade;
import com.tradingco.trading.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Analytics service — calculates performance metrics from trade history.
 */
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TradeRepository tradeRepository;
    private final AccountRepository accountRepository;

    public Map<String, Object> getSummary(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId.toString()));

        List<Trade> trades = tradeRepository.findByAccountIdOrderByExitTimeDesc(accountId);

        Map<String, Object> metrics = new LinkedHashMap<>();
        metrics.put("accountId", accountId);
        metrics.put("initialBalance", account.getInitialBalance());
        metrics.put("cashBalance", account.getCashBalance());

        if (trades.isEmpty()) {
            metrics.put("totalTrades", 0);
            metrics.put("winRate", 0);
            metrics.put("totalPnl", BigDecimal.ZERO);
            metrics.put("avgWin", BigDecimal.ZERO);
            metrics.put("avgLoss", BigDecimal.ZERO);
            metrics.put("profitFactor", 0);
            metrics.put("maxDrawdown", BigDecimal.ZERO);
            metrics.put("sharpeRatio", 0);
            return metrics;
        }

        long winners = trades.stream().filter(t -> t.getPnl().compareTo(BigDecimal.ZERO) > 0).count();
        long losers = trades.stream().filter(t -> t.getPnl().compareTo(BigDecimal.ZERO) < 0).count();
        BigDecimal totalPnl = trades.stream().map(Trade::getPnl).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal grossProfit = trades.stream()
                .map(Trade::getPnl).filter(p -> p.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal grossLoss = trades.stream()
                .map(Trade::getPnl).filter(p -> p.compareTo(BigDecimal.ZERO) < 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add).abs();

        BigDecimal avgWin = winners > 0 ? grossProfit.divide(BigDecimal.valueOf(winners), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        BigDecimal avgLoss = losers > 0 ? grossLoss.divide(BigDecimal.valueOf(losers), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;
        double profitFactor = grossLoss.compareTo(BigDecimal.ZERO) != 0
                ? grossProfit.divide(grossLoss, 4, RoundingMode.HALF_UP).doubleValue() : 0;

        // Max drawdown calculation
        BigDecimal peak = account.getInitialBalance();
        BigDecimal maxDD = BigDecimal.ZERO;
        BigDecimal equity = account.getInitialBalance();
        List<Trade> chronological = new ArrayList<>(trades);
        chronological.sort(Comparator.comparing(Trade::getExitTime));
        for (Trade t : chronological) {
            equity = equity.add(t.getPnl());
            if (equity.compareTo(peak) > 0) peak = equity;
            BigDecimal dd = peak.subtract(equity);
            if (dd.compareTo(maxDD) > 0) maxDD = dd;
        }

        // Sharpe ratio (simplified)
        double[] returns = trades.stream().mapToDouble(t -> t.getPnlPercent().doubleValue()).toArray();
        double avgReturn = Arrays.stream(returns).average().orElse(0);
        double stdDev = Math.sqrt(Arrays.stream(returns).map(r -> Math.pow(r - avgReturn, 2)).average().orElse(0));
        double sharpe = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

        metrics.put("totalTrades", trades.size());
        metrics.put("winners", winners);
        metrics.put("losers", losers);
        metrics.put("winRate", trades.size() > 0 ? Math.round((double) winners / trades.size() * 100) : 0);
        metrics.put("totalPnl", totalPnl);
        metrics.put("grossProfit", grossProfit);
        metrics.put("grossLoss", grossLoss);
        metrics.put("avgWin", avgWin);
        metrics.put("avgLoss", avgLoss);
        metrics.put("profitFactor", profitFactor);
        metrics.put("maxDrawdown", maxDD);
        metrics.put("sharpeRatio", Math.round(sharpe * 100.0) / 100.0);
        metrics.put("bestTrade", trades.stream().map(Trade::getPnl).max(Comparator.naturalOrder()).orElse(BigDecimal.ZERO));
        metrics.put("worstTrade", trades.stream().map(Trade::getPnl).min(Comparator.naturalOrder()).orElse(BigDecimal.ZERO));

        return metrics;
    }

    public List<Map<String, Object>> getEquityCurve(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId.toString()));

        List<Trade> trades = tradeRepository.findByAccountIdOrderByExitTimeDesc(accountId);
        List<Trade> chronological = new ArrayList<>(trades);
        chronological.sort(Comparator.comparing(Trade::getExitTime));

        List<Map<String, Object>> curve = new ArrayList<>();
        BigDecimal equity = account.getInitialBalance();
        curve.add(Map.of("time", account.getCreatedAt().toString(), "equity", equity));

        for (Trade t : chronological) {
            equity = equity.add(t.getPnl());
            curve.add(Map.of("time", t.getExitTime().toString(), "equity", equity, "pnl", t.getPnl()));
        }

        return curve;
    }
}
