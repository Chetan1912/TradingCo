package com.tradingco.market.repository;

import com.tradingco.market.model.Candle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CandleRepository extends JpaRepository<Candle, Long> {

    @Query("SELECT c FROM Candle c WHERE c.symbol = :symbol AND c.timeframe = :tf " +
           "AND c.openTime >= :from AND c.openTime <= :to ORDER BY c.openTime ASC")
    List<Candle> findCandles(@Param("symbol") String symbol,
                            @Param("tf") String timeframe,
                            @Param("from") LocalDateTime from,
                            @Param("to") LocalDateTime to);

    @Query("SELECT c FROM Candle c WHERE c.symbol = :symbol AND c.timeframe = :tf " +
           "ORDER BY c.openTime DESC LIMIT :limit")
    List<Candle> findLatest(@Param("symbol") String symbol,
                            @Param("tf") String timeframe,
                            @Param("limit") int limit);
}
