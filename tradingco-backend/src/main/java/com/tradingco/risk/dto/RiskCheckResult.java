package com.tradingco.risk.dto;

import java.util.List;

public record RiskCheckResult(
        List<String> warnings,
        List<String> blocks
) {
    public boolean hasBlocks() {
        return blocks != null && !blocks.isEmpty();
    }
}
