package com.mahmud.orderservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class CartDTO {
    private Long id;
    private String userId;
    private List<CartItemDTO> items;
}