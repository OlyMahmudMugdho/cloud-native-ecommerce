package com.mahmud.orderservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String userId;

    @Column(columnDefinition = "TEXT")
    private String itemsJson;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private double totalAmount;

    private String checkoutSessionId;
}