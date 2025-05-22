package com.mahmud.orderservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String userId;
    private List<CartItemDTO> items;
    private String status; // e.g., PENDING, PAID, FAILED
    private double totalAmount;
    private String checkoutSessionId;
}