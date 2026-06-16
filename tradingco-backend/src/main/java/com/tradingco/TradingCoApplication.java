package com.tradingco;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TradingCoApplication {

    public static void main(String[] args) {
        SpringApplication.run(TradingCoApplication.class, args);
    }
}
