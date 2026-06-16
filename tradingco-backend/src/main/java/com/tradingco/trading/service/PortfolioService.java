package com.tradingco.trading.service;

import com.tradingco.account.model.Account;
import com.tradingco.account.repository.AccountRepository;
import com.tradingco.common.exception.ResourceNotFoundException;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.QuoteRepository;
import com.tradingco.trading.dto.*;
import com.tradingco.trading.model.Position;
import com.tradingco.trading.model.Trade;
import com.tradingco.trading.repository.PositionRepository;
import com.tradingco.trading.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

/**
 * Portfolio aggregation service — calculates total equity, P&L,
 * and keeps positions updated with current market prices.
 */
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PositionRepository positionRepository;
    private final TradeRepository tradeRepository;
    private final AccountRepository accountRepository;
    private final QuoteRepository quoteRepository;

    /**
     * Get full portfolio summary for an account.
     */
    public PortfolioSummaryResponse getPortfolioSummary(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId.toString()));

        List<Position> positions = positionRepository.findByAccountId(accountId);

        // Update each position with current market price
        BigDecimal totalPositionsValue = BigDecimal.ZERO;
        BigDecimal totalUnrealizedPnl = BigDecimal.ZERO;

        for (Position pos : positions) {
            Quote quote = quoteRepository.findBySymbol(pos.getSymbol()).orElse(null);
            if (quote != null) {
                pos.updateMarketData(quote.getLastPrice());
                positionRepository.save(pos);
            }
            if (pos.getMarketValue() != null) {
                totalPositionsValue = totalPositionsValue.add(pos.getMarketValue());
            }
            if (pos.getUnrealizedPnl() != null) {
                totalUnrealizedPnl = totalUnrealizedPnl.add(pos.getUnrealizedPnl());
            }
        }

        BigDecimal cashBalance = account.getCashBalance();
        BigDecimal totalEquity = cashBalance.add(totalPositionsValue);
        BigDecimal initialBalance = account.getInitialBalance();
        BigDecimal dayPnl = totalEquity.subtract(initialBalance);
        BigDecimal dayPnlPct = initialBalance.compareTo(BigDecimal.ZERO) != 0
                ? dayPnl.divide(initialBalance, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;
        BigDecimal unrealizedPnlPct = totalPositionsValue.compareTo(BigDecimal.ZERO) != 0
                ? totalUnrealizedPnl.divide(totalPositionsValue.subtract(totalUnrealizedPnl), 4, RoundingMode.HALF_UP)
                        .multiply(new BigDecimal("100"))
                : BigDecimal.ZERO;

        List<Trade> trades = tradeRepository.findByAccountIdOrderByExitTimeDesc(accountId);

        List<PositionResponse> positionResponses = positions.stream()
                .map(PositionResponse::from).toList();

        return new PortfolioSummaryResponse(
                totalEquity, cashBalance, totalPositionsValue,
                totalUnrealizedPnl, unrealizedPnlPct, dayPnl, dayPnlPct,
                positions.size(), trades.size(), positionResponses
        );
    }

    /**
     * Get all positions for an account.
     */
    public List<PositionResponse> getPositions(UUID accountId) {
        List<Position> positions = positionRepository.findByAccountId(accountId);
        // Update with current prices
        for (Position pos : positions) {
            Quote quote = quoteRepository.findBySymbol(pos.getSymbol()).orElse(null);
            if (quote != null) {
                pos.updateMarketData(quote.getLastPrice());
            }
        }
        return positions.stream().map(PositionResponse::from).toList();
    }

    /**
     * Get trade history for an account.
     */
    public List<TradeResponse> getTradeHistory(UUID accountId) {
        return tradeRepository.findByAccountIdOrderByExitTimeDesc(accountId)
                .stream().map(TradeResponse::from).toList();
    }
}
