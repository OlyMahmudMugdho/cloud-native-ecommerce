package com.mahmud.productservice.controller;

import com.mahmud.productservice.dto.CartDTO;
import com.mahmud.productservice.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/products/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CartDTO addToCart(@AuthenticationPrincipal Jwt jwt, @RequestBody CartDTO cartDTO) {
        String userId = jwt.getSubject();
        return cartService.addToCart(userId, cartDTO);
    }

    @GetMapping
    public CartDTO getCart(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return cartService.getCart(userId);
    }

    @PutMapping
    public CartDTO updateCart(@AuthenticationPrincipal Jwt jwt, @RequestBody CartDTO cartDTO) {
        String userId = jwt.getSubject();
        return cartService.updateCart(userId, cartDTO);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCart(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        cartService.deleteCart(userId);
    }
}