package com.tradingco.market.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "candles", uniqueConstraints = @UniqueConstraint(columnNames = {"symbol", "timeframe", "open_time"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Candle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String symbol;

    @Column(nullable = false, length = 5)
    private String timeframe;

    @Column(name = "open_time", nullable = false)
    private LocalDateTime openTime;

    @Column(name = "open", nullable = false)
    private BigDecimal open;

    @Column(nullable = false)
    private BigDecimal high;

    @Column(nullable = false)
    private BigDecimal low;

    @Column(name = "close", nullable = false)
    private BigDecimal close;

    @Builder.Default
    private Long volume = 0L;
}
