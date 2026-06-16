package com.tradingco.trading.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trades")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(nullable = false, length = 5)
    private String side;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "entry_price", nullable = false)
    private BigDecimal entryPrice;

    @Column(name = "exit_price", nullable = false)
    private BigDecimal exitPrice;

    @Column(name = "entry_time", nullable = false)
    private LocalDateTime entryTime;

    @Column(name = "exit_time", nullable = false)
    private LocalDateTime exitTime;

    @Column(nullable = false)
    private BigDecimal pnl;

    @Column(name = "pnl_percent", nullable = false)
    private BigDecimal pnlPercent;

    @Column(name = "commission_total")
    @Builder.Default
    private BigDecimal commissionTotal = BigDecimal.ZERO;

    @Column(name = "entry_order_id")
    private UUID entryOrderId;

    @Column(name = "exit_order_id")
    private UUID exitOrderId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
