package com.mahmud.productservice.feign;

import com.mahmud.productservice.dto.AllProductsDto;
import com.mahmud.productservice.dto.ErrorResponse;
import com.mahmud.productservice.dto.ProductDTO;
import com.mahmud.productservice.dto.StockUpdateDTO;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(name = "INVENTORY-SERVICE")
public interface InventoryServiceClient {

    @GetMapping("/inventory/api/products")
    @CircuitBreaker(name = "inventoryService", fallbackMethod = "getProductsFallback")
    AllProductsDto getAllProducts();

    @GetMapping("/inventory/api/products/{id}")
    @CircuitBreaker(name = "inventoryService", fallbackMethod = "getProductFallback")
    ProductDTO getProductById(@PathVariable("id") String id);

    @PostMapping("/stocks/bulk-update")
    void updateStock(@RequestBody List<StockUpdateDTO> updates, @RequestHeader("X-API-Key") String apiKey);

    default List<ProductDTO> getProductsFallback(Throwable t) {
        System.out.println("failed");
        return List.of();
    }

    default ErrorResponse getProductFallback(String id, Throwable t) {
        System.out.println("================ __from here....");
        return new ErrorResponse(500, "Product Not Found");
    }
}