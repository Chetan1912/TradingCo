package com.tradingco.analytics.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "performance_snapshots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "total_equity", nullable = false, precision = 15, scale = 4)
    private BigDecimal totalEquity;

    @Column(name = "cash_balance", nullable = false, precision = 15, scale = 4)
    private BigDecimal cashBalance;

    @Column(name = "positions_value", nullable = false, precision = 15, scale = 4)
    private BigDecimal positionsValue;

    @Column(name = "daily_pnl", precision = 15, scale = 4)
    private BigDecimal dailyPnl;

    @Column(name = "cumulative_pnl", precision = 15, scale = 4)
    private BigDecimal cumulativePnl;

    @Column(name = "trade_count")
    private Integer tradeCount;

    @Column(name = "win_count")
    private Integer winCount;

    @Column(name = "loss_count")
    private Integer lossCount;
}
