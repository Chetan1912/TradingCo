package com.tradingco.news.controller;

import com.tradingco.news.service.NewsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getNews(
            @RequestParam(required = false) String symbol,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(newsService.getNews(symbol, limit));
    }

    @GetMapping("/trending")
    public ResponseEntity<List<Map<String, Object>>> getTrending() {
        return ResponseEntity.ok(newsService.getTrendingNews());
    }
}
