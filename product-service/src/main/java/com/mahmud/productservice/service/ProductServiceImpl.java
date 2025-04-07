package com.mahmud.productservice.service;

import com.mahmud.productservice.dto.AllProductsDto;
import com.mahmud.productservice.dto.ProductDTO;
import com.mahmud.productservice.exception.ResourceNotFoundException;
import com.mahmud.productservice.feign.InventoryServiceClient;
import org.springframework.stereotype.Service;


@Service
public class ProductServiceImpl implements ProductService {

    private final InventoryServiceClient inventoryServiceClient;

    public ProductServiceImpl(InventoryServiceClient inventoryServiceClient) {
        this.inventoryServiceClient = inventoryServiceClient;
    }

    @Override
    public AllProductsDto getAllProducts() {
        return inventoryServiceClient.getAllProducts();
    }

    @Override
    public ProductDTO getProductById(String id) {
        ProductDTO product = inventoryServiceClient.getProductById(id);
        if (product == null) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        return product;
    }
}