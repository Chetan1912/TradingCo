package com.tradingco.trading.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "positions", uniqueConstraints = @UniqueConstraint(columnNames = {"account_id", "symbol"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Side side;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "avg_cost", nullable = false)
    private BigDecimal avgCost;

    @Column(name = "current_price")
    private BigDecimal currentPrice;

    @Column(name = "market_value")
    private BigDecimal marketValue;

    @Column(name = "unrealized_pnl")
    private BigDecimal unrealizedPnl;

    @Column(name = "unrealized_pnl_pct")
    private BigDecimal unrealizedPnlPct;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        openedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Recalculate market value and unrealized P&L from current price.
     */
    public void updateMarketData(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
        this.marketValue = currentPrice.multiply(BigDecimal.valueOf(quantity));
        BigDecimal costBasis = avgCost.multiply(BigDecimal.valueOf(quantity));
        if (side == Side.BUY) {
            unrealizedPnl = marketValue.subtract(costBasis);
        } else {
            unrealizedPnl = costBasis.subtract(marketValue);
        }
        if (costBasis.compareTo(BigDecimal.ZERO) != 0) {
            unrealizedPnlPct = unrealizedPnl.divide(costBasis, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
    }
}
