package com.mahmud.orderservice.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private String id;
    private String name;
    private double price;
    private String category;
    private String imageUrl;
    private int stock;
}