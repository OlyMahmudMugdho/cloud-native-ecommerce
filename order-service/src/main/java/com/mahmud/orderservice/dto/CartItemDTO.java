package com.mahmud.orderservice.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private String productId;
    private int quantity;
}