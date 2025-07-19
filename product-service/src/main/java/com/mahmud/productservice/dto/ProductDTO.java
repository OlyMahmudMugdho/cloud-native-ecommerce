package com.mahmud.productservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class ProductDTO {
    private String id;
    private String name;
    private String description;
    private double price;
    private String category;
    @JsonProperty("image_url")
    private String imageUrl;
    private int stock;
}