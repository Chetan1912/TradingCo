package com.tradingco.trading.repository;

import com.tradingco.trading.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface TradeRepository extends JpaRepository<Trade, UUID> {

    List<Trade> findByAccountIdOrderByExitTimeDesc(UUID accountId);

    List<Trade> findByAccountIdAndSymbolOrderByExitTimeDesc(UUID accountId, String symbol);
}
