package com.mahmud.productservice.service;

import com.mahmud.productservice.dto.AllProductsDto;
import com.mahmud.productservice.dto.ProductDTO;
import com.mahmud.productservice.exception.ResourceNotFoundException;
import com.mahmud.productservice.feign.InventoryServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class ProductServiceImplTest {

    InventoryServiceClient inventoryServiceClient;
    ProductServiceImpl productService;

    @BeforeEach
    void setUp() {
        inventoryServiceClient = Mockito.mock(InventoryServiceClient.class);
        productService = new ProductServiceImpl(inventoryServiceClient);
    }

    @Test
    void getAllProducts_delegatesToClient() {
        AllProductsDto dto = new AllProductsDto();
        dto.products = java.util.Collections.emptyList();
        when(inventoryServiceClient.getAllProducts()).thenReturn(dto);

        AllProductsDto result = productService.getAllProducts();

        assertNotNull(result);
        assertSame(dto, result);
        verify(inventoryServiceClient, times(1)).getAllProducts();
    }

    @Test
    void getProductById_returnsProduct_whenFound() {
        ProductDTO p = new ProductDTO();
        p.setId("p1");
        when(inventoryServiceClient.getProductById("p1")).thenReturn(p);

        ProductDTO result = productService.getProductById("p1");

        assertNotNull(result);
        assertEquals("p1", result.getId());
    }

    @Test
    void getProductById_throwsNotFound_whenClientReturnsNull() {
        when(inventoryServiceClient.getProductById(anyString())).thenReturn(null);

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById("missing"));
    }
}
