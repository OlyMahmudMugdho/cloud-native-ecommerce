package com.mahmud.orderservice.dto;

import lombok.Data;

@Data
public class StockUpdateDTO {
    private String productId;
    private int stock;
}