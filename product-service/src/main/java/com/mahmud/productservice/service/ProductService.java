package com.mahmud.productservice.service;

import com.mahmud.productservice.dto.AllProductsDto;
import com.mahmud.productservice.dto.ProductDTO;


public interface ProductService {
    AllProductsDto getAllProducts();
    ProductDTO getProductById(String id);
}