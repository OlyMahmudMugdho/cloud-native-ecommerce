package com.mahmud.productservice.service;

import com.mahmud.productservice.dto.CartDTO;

public interface CartService {
    CartDTO addToCart(String userId, CartDTO cartDTO);
    CartDTO getCart(String userId);
    CartDTO updateCart(String userId, CartDTO cartDTO);
    void deleteCart(String userId);
}