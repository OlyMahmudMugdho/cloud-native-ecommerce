package com.mahmud.orderservice.feign;

import com.mahmud.orderservice.config.FeignConfig;
import com.mahmud.orderservice.dto.CartDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-service", url="http://product-service", configuration = FeignConfig.class)
public interface ProductServiceClient {

    @GetMapping("/api/products/cart/{userId}")
    @CircuitBreaker(name = "productService", fallbackMethod = "getCartFallback")
    CartDTO getCart(@PathVariable("userId") String userId, @RequestHeader("X-API-Key") String apiKey);

    default CartDTO getCartFallback(String apiKey, Throwable t) {
        System.err.println("Fallback triggered for getCart: " + t.getMessage());
        return null;
    }


    @DeleteMapping("/api/products/cart/{userId}")
    @CircuitBreaker(name = "productService", fallbackMethod = "deleteCartFallback")
    CartDTO deleteCart(@PathVariable("userId") String userId, @RequestHeader("X-API-Key") String apiKey);

    default CartDTO deleteCartFallback(String apiKey, Throwable t) {
        System.err.println("Fallback triggered for deleteCart: " + t.getMessage());
        return null;
    }
}
