package com.mahmud.orderservice.controller;

import com.mahmud.orderservice.dto.OrderDTO;
import com.mahmud.orderservice.dto.StripeResponse;
import com.mahmud.orderservice.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.OK)
    public StripeResponse createCheckoutSession(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return orderService.createCheckoutSession(userId);
    }

    @GetMapping("/{id}")
    public OrderDTO getOrder(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return orderService.getOrder(id, userId);
    }
}