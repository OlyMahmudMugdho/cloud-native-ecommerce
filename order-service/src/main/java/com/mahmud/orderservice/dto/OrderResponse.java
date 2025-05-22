package com.mahmud.orderservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderResponse {
    private String status;
    private String message;
    private Long orderId;
    private String checkoutSessionId;
    private String checkoutUrl;
}