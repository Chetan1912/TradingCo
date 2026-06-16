package com.tradingco.market.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assets")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 20)
    private String symbol;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "asset_type", nullable = false, length = 20)
    private String assetType;

    @Column(length = 50)
    private String exchange;

    @Column(length = 100)
    private String sector;

    @Column(length = 100)
    private String industry;

    @Column(name = "market_cap")
    private Long marketCap;

    @Column(name = "pe_ratio")
    private BigDecimal peRatio;

    private BigDecimal eps;

    @Column(name = "dividend_yield")
    private BigDecimal dividendYield;

    private BigDecimal beta;

    @Column(name = "high_52w")
    private BigDecimal high52w;

    @Column(name = "low_52w")
    private BigDecimal low52w;

    @Column(name = "avg_volume")
    private Long avgVolume;

    @Column(name = "lot_size")
    @Builder.Default
    private Integer lotSize = 1;

    @Column(name = "tick_size")
    @Builder.Default
    private BigDecimal tickSize = new BigDecimal("0.01");

    @Column(name = "is_tradeable")
    @Builder.Default
    private Boolean isTradeable = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
