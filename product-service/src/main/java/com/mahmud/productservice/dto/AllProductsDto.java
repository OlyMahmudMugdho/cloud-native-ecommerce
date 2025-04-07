package com.mahmud.productservice.dto;

import java.util.List;

public class AllProductsDto {
    public List<ProductDTO> products;
    public Integer total;
    public Integer page;
    public Integer limit;
    public Integer total_pages;
}
