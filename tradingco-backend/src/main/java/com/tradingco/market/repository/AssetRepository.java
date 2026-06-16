package com.tradingco.market.repository;

import com.tradingco.market.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AssetRepository extends JpaRepository<Asset, UUID> {

    Optional<Asset> findBySymbol(String symbol);

    boolean existsBySymbol(String symbol);

    @Query("SELECT a FROM Asset a WHERE LOWER(a.symbol) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(a.name) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY a.symbol")
    List<Asset> search(@Param("q") String query);

    List<Asset> findByAssetType(String assetType);

    List<Asset> findBySector(String sector);

    @Query("SELECT a FROM Asset a WHERE a.isTradeable = true ORDER BY a.symbol")
    List<Asset> findAllTradeable();
}
