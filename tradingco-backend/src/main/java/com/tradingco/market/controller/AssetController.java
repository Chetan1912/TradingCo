package com.tradingco.market.controller;

import com.tradingco.common.exception.ResourceNotFoundException;
import com.tradingco.market.dto.AssetResponse;
import com.tradingco.market.model.Asset;
import com.tradingco.market.model.Quote;
import com.tradingco.market.repository.AssetRepository;
import com.tradingco.market.repository.QuoteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "Asset information and search")
public class AssetController {

    private final AssetRepository assetRepository;
    private final QuoteRepository quoteRepository;

    @GetMapping("/{symbol}")
    @Operation(summary = "Get asset details by symbol")
    public ResponseEntity<AssetResponse> getAsset(@PathVariable String symbol) {
        Asset asset = assetRepository.findBySymbol(symbol.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Asset", "symbol", symbol));
        Quote quote = quoteRepository.findBySymbol(symbol.toUpperCase()).orElse(null);
        return ResponseEntity.ok(toResponse(asset, quote));
    }

    @GetMapping("/search")
    @Operation(summary = "Search assets by symbol or name")
    public ResponseEntity<List<AssetResponse>> search(@RequestParam String q) {
        List<Asset> results = assetRepository.search(q);
        return ResponseEntity.ok(results.stream().map(a -> {
            Quote quote = quoteRepository.findBySymbol(a.getSymbol()).orElse(null);
            return toResponse(a, quote);
        }).toList());
    }

    @GetMapping
    @Operation(summary = "List all assets, optionally filtered by type or sector")
    public ResponseEntity<List<AssetResponse>> listAssets(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String sector) {
        List<Asset> assets;
        if (type != null) assets = assetRepository.findByAssetType(type.toUpperCase());
        else if (sector != null) assets = assetRepository.findBySector(sector);
        else assets = assetRepository.findAll();

        return ResponseEntity.ok(assets.stream().map(a -> {
            Quote quote = quoteRepository.findBySymbol(a.getSymbol()).orElse(null);
            return toResponse(a, quote);
        }).toList());
    }

    private AssetResponse toResponse(Asset a, Quote q) {
        return new AssetResponse(
                a.getId(), a.getSymbol(), a.getName(), a.getAssetType(),
                a.getExchange(), a.getSector(), a.getIndustry(), a.getMarketCap(),
                a.getPeRatio(), a.getEps(), a.getDividendYield(), a.getBeta(),
                a.getHigh52w(), a.getLow52w(), a.getAvgVolume(),
                q != null ? q.getLastPrice() : null,
                q != null ? q.getChangeAmount() : null,
                q != null ? q.getChangePercent() : null,
                q != null ? q.getVolume() : null
        );
    }
}
