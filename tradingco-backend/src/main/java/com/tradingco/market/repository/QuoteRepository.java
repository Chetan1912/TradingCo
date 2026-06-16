package com.tradingco.market.repository;

import com.tradingco.market.model.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuoteRepository extends JpaRepository<Quote, UUID> {

    Optional<Quote> findBySymbol(String symbol);

    List<Quote> findBySymbolIn(List<String> symbols);
}
