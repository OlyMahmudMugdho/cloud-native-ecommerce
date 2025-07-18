package com.mahmud.orderservice.repository;

import com.mahmud.orderservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByCheckoutSessionId(String checkoutSessionId);

    List<Order> findByUserId(String userId);
}