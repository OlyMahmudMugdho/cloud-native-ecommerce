package com.mahmud.orderservice.feign;

import com.mahmud.orderservice.config.FeignConfig;
import com.mahmud.orderservice.dto.CartDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service", configuration = FeignConfig.class)
public interface ProductServiceClient {

    @GetMapping("/products/cart")
    @CircuitBreaker(name = "productService", fallbackMethod = "getCartFallback")
    CartDTO getCart(@PathVariable("userId") String userId);

    default CartDTO getCartFallback(String userId, Throwable t) {
        return null;
    }
}