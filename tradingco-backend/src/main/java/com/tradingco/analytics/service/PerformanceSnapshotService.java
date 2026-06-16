package com.tradingco.analytics.service;

import com.tradingco.account.model.Account;
import com.tradingco.account.repository.AccountRepository;
import com.tradingco.analytics.model.PerformanceSnapshot;
import com.tradingco.analytics.repository.PerformanceSnapshotRepository;
import com.tradingco.trading.model.Position;
import com.tradingco.trading.model.Trade;
import com.tradingco.trading.repository.PositionRepository;
import com.tradingco.trading.repository.TradeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceSnapshotService {

    private final PerformanceSnapshotRepository snapshotRepository;
    private final AccountRepository accountRepository;
    private final PositionRepository positionRepository;
    private final TradeRepository tradeRepository;

    /**
     * Daily snapshot scheduled at 4:30 PM (after NYSE market close).
     * For demo purposes, we also allow taking a snapshot on demand.
     */
    @Scheduled(cron = "0 30 16 * * MON-FRI")
    @Transactional
    public void scheduleDailySnapshots() {
        log.info("Starting daily performance snapshot scheduler...");
        List<Account> accounts = accountRepository.findAll();
        LocalDate today = LocalDate.now();
        for (Account account : accounts) {
            try {
                takeSnapshot(account, today);
            } catch (Exception e) {
                log.error("Failed to take snapshot for account {}: {}", account.getId(), e.getMessage());
            }
        }
        log.info("Daily performance snapshot scheduler completed.");
    }

    @Transactional
    public PerformanceSnapshot takeSnapshot(Account account, LocalDate date) {
        // Calculate current holdings value
        List<Position> positions = positionRepository.findByAccountId(account.getId());
        BigDecimal positionsValue = positions.stream()
                .map(Position::getMarketValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal currentEquity = account.getCashBalance().add(positionsValue);
        BigDecimal initialBalance = account.getInitialBalance();

        // Calculate trades metrics for the snapshot date
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
        List<Trade> trades = tradeRepository.findByAccountIdOrderByExitTimeDesc(account.getId());
        List<Trade> todayTrades = trades.stream()
                .filter(t -> !t.getExitTime().isBefore(startOfDay) && t.getExitTime().isBefore(endOfDay))
                .toList();

        int tradeCount = todayTrades.size();
        int winCount = (int) todayTrades.stream().filter(t -> t.getPnl().compareTo(BigDecimal.ZERO) > 0).count();
        int lossCount = (int) todayTrades.stream().filter(t -> t.getPnl().compareTo(BigDecimal.ZERO) < 0).count();

        // Calculate Daily PnL
        BigDecimal dailyPnl = BigDecimal.ZERO;
        Optional<PerformanceSnapshot> prevSnapshotOpt = snapshotRepository.findByAccountIdAndSnapshotDate(
                account.getId(), date.minusDays(1));
        if (prevSnapshotOpt.isPresent()) {
            dailyPnl = currentEquity.subtract(prevSnapshotOpt.get().getTotalEquity());
        } else {
            // If no previous snapshot, daily pnl is change since open/initial or sum of today's trade P&L
            dailyPnl = todayTrades.stream().map(Trade::getPnl).reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        BigDecimal cumulativePnl = currentEquity.subtract(initialBalance);

        // Save or update snapshot
        Optional<PerformanceSnapshot> existingOpt = snapshotRepository.findByAccountIdAndSnapshotDate(
                account.getId(), date);

        PerformanceSnapshot snapshot = existingOpt.orElse(new PerformanceSnapshot());
        snapshot.setAccountId(account.getId());
        snapshot.setSnapshotDate(date);
        snapshot.setTotalEquity(currentEquity);
        snapshot.setCashBalance(account.getCashBalance());
        snapshot.setPositionsValue(positionsValue);
        snapshot.setDailyPnl(dailyPnl);
        snapshot.setCumulativePnl(cumulativePnl);
        snapshot.setTradeCount(tradeCount);
        snapshot.setWinCount(winCount);
        snapshot.setLossCount(lossCount);

        return snapshotRepository.save(snapshot);
    }
}
