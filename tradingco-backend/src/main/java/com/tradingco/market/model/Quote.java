package com.tradingco.market.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quotes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Quote {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 20, unique = true)
    private String symbol;

    @Column(nullable = false)
    private BigDecimal bid;

    @Column(nullable = false)
    private BigDecimal ask;

    @Column(name = "last_price", nullable = false)
    private BigDecimal lastPrice;

    @Column(name = "prev_close")
    private BigDecimal prevClose;

    @Column(name = "open_price")
    private BigDecimal openPrice;

    @Column(name = "day_high")
    private BigDecimal dayHigh;

    @Column(name = "day_low")
    private BigDecimal dayLow;

    @Builder.Default
    private Long volume = 0L;

    private BigDecimal vwap;

    @Column(name = "change_amount")
    private BigDecimal changeAmount;

    @Column(name = "change_percent")
    private BigDecimal changePercent;

    @Column(name = "market_status", length = 20)
    @Builder.Default
    private String marketStatus = "CLOSED";

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Recalculate change fields from last vs prev close
     */
    public void recalculate() {
        if (prevClose != null && prevClose.compareTo(BigDecimal.ZERO) != 0) {
            changeAmount = lastPrice.subtract(prevClose);
            changePercent = changeAmount.divide(prevClose, 4, java.math.RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }
    }
}
