package com.tradingco.alert.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Column(name = "target_value", nullable = false, precision = 15, scale = 6)
    private BigDecimal targetValue;

    @Column(name = "is_triggered")
    private Boolean isTriggered;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "triggered_at")
    private LocalDateTime triggeredAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isTriggered = false;
        isActive = true;
    }

    public enum AlertType {
        PRICE_ABOVE, PRICE_BELOW
    }
}
