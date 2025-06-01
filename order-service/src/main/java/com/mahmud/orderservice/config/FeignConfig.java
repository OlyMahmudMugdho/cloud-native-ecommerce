package com.mahmud.orderservice.config;

import feign.Logger;
import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Value("${inventory-service.api-key}")
    private String productServiceApiKey;

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // Add X-API-Key header
            requestTemplate.header("X-API-Key", productServiceApiKey);
            System.out.println("Added X-API-Key header to Feign request: " + productServiceApiKey);
        };
    }

    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL; // Enable full logging for Feign requests
    }
}