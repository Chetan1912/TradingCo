package com.tradingco.trading.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "orders")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 4)
    private Side side;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type", nullable = false, length = 20)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "filled_quantity")
    @Builder.Default
    private Integer filledQuantity = 0;

    @Column(name = "limit_price")
    private BigDecimal limitPrice;

    @Column(name = "stop_price")
    private BigDecimal stopPrice;

    @Column(name = "avg_fill_price")
    private BigDecimal avgFillPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_in_force", length = 5)
    @Builder.Default
    private TimeInForce timeInForce = TimeInForce.DAY;

    @Column(name = "stop_loss")
    private BigDecimal stopLoss;

    @Column(name = "take_profit")
    private BigDecimal takeProfit;

    @Column(name = "parent_order_id")
    private UUID parentOrderId;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "filled_at")
    private LocalDateTime filledAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Transient
    private java.util.List<String> warnings;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isFilled() {
        return status == OrderStatus.FILLED;
    }

    public boolean isActive() {
        return status == OrderStatus.PENDING || status == OrderStatus.ACCEPTED
                || status == OrderStatus.PARTIALLY_FILLED;
    }
}
