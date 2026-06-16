package com.tradingco.news.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Simulated news generator — creates realistic market news items.
 */
@Service
@Slf4j
public class NewsService {

    private final List<Map<String, Object>> newsItems = Collections.synchronizedList(new ArrayList<>());
    private final Random random = new Random();

    private static final String[][] NEWS_TEMPLATES = {
        {"AAPL", "Apple Reports Record iPhone Sales in Q4", "Apple Inc. announced quarterly revenue of $94.8 billion, driven by strong iPhone demand in emerging markets."},
        {"MSFT", "Microsoft Azure Revenue Surges 30%", "Cloud computing continues to drive Microsoft's growth as Azure captures market share from competitors."},
        {"TSLA", "Tesla Unveils Next-Gen Battery Technology", "Tesla announced a breakthrough in battery energy density that could extend EV range by 40%."},
        {"NVDA", "NVIDIA Dominates AI Chip Market", "NVIDIA's data center revenue doubled year-over-year, fueled by surging demand for AI training hardware."},
        {"AMZN", "Amazon Expands Same-Day Delivery", "Amazon is investing $10B in logistics infrastructure to enable same-day delivery in 100 additional cities."},
        {"GOOGL", "Alphabet's Waymo Launches in 5 New Cities", "Waymo's autonomous ride-hailing service expands operations, now covering 15 major US metropolitan areas."},
        {"META", "Meta's VR Headset Sales Exceed Expectations", "Meta Quest 3 sales surpassed 10 million units, signaling growing mainstream adoption of VR technology."},
        {"JPM", "JPMorgan Raises Interest Rate Forecast", "JPMorgan economists now expect the Fed to maintain higher rates through 2025, citing persistent inflation."},
        {"SPY", "S&P 500 Hits New All-Time High", "The benchmark index closed at a record, driven by strong earnings reports from technology and healthcare sectors."},
        {"QQQ", "Tech Sector Leads Market Rally", "Technology stocks outperformed, with the NASDAQ Composite gaining 1.5% amid positive earnings outlook."},
        {"V", "Visa Reports Strong Cross-Border Volume Growth", "Visa's cross-border transaction volume increased 20%, reflecting a rebound in international travel."},
        {"DIS", "Disney Streaming Reaches Profitability Milestone", "Disney+ turned its first quarterly profit, with subscriber growth exceeding analyst expectations."},
    };

    @Scheduled(fixedRate = 30000)
    public void generateNews() {
        int index = random.nextInt(NEWS_TEMPLATES.length);
        String[] template = NEWS_TEMPLATES[index];
        Map<String, Object> item = Map.of(
                "id", UUID.randomUUID().toString(),
                "symbol", template[0],
                "headline", template[1],
                "summary", template[2],
                "source", random.nextBoolean() ? "Reuters" : "Bloomberg",
                "sentiment", random.nextDouble() > 0.3 ? "POSITIVE" : "NEGATIVE",
                "publishedAt", LocalDateTime.now().toString()
        );
        newsItems.add(0, item);
        if (newsItems.size() > 100) newsItems.subList(100, newsItems.size()).clear();
    }

    public List<Map<String, Object>> getNews(String symbol, int limit) {
        if (symbol != null && !symbol.isEmpty()) {
            return newsItems.stream()
                    .filter(n -> n.get("symbol").equals(symbol.toUpperCase()))
                    .limit(limit).toList();
        }
        return newsItems.stream().limit(limit).toList();
    }

    public List<Map<String, Object>> getTrendingNews() {
        return newsItems.stream().limit(20).toList();
    }
}
