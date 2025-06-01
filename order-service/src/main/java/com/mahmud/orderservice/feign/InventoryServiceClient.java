package com.mahmud.orderservice.feign;

import com.mahmud.orderservice.config.FeignConfig;
import com.mahmud.orderservice.dto.ProductDTO;
import com.mahmud.orderservice.dto.StockUpdateDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "inventory-service", configuration = FeignConfig.class)
public interface InventoryServiceClient {

    @GetMapping("/products")
    @CircuitBreaker(name = "inventoryService", fallbackMethod = "getProductsFallback")
    List<ProductDTO> getAllProducts();

    @GetMapping("/inventory/api/products/{id}")
    @CircuitBreaker(name = "inventoryService", fallbackMethod = "getProductFallback")
    ProductDTO getProductById(@PathVariable("id") String id);

    @PostMapping("/inventory/api/stocks/bulk-update")
    void updateStock(@RequestBody StockUpdateDTO updates, @RequestHeader("X-API-Key") String apiKey);

    default List<ProductDTO> getProductsFallback(Throwable t) {
        return List.of();
    }

    default ProductDTO getProductFallback(String id, Throwable t) {
        return null;
    }
}
