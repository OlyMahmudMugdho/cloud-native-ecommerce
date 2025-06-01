package com.mahmud.orderservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class StockUpdateDTO {
    private List<ProductUpdate> products;

    @Data
    public static class ProductUpdate {
        private String productId;
        private int quantity;
        private boolean increment;
    }
}