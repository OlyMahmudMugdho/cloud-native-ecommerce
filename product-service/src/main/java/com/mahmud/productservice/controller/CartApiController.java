package com.mahmud.productservice.controller;

import com.mahmud.productservice.dto.CartDTO;
import com.mahmud.productservice.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products/cart")
public class CartApiController {

    private final CartService cartService;

    public CartApiController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public CartDTO addToCart(@PathVariable String userId, @RequestBody CartDTO cartDTO) {
        return cartService.addToCart(userId, cartDTO);
    }

    @GetMapping("/{userId}")
    public CartDTO getCart(@PathVariable String userId) {
        return cartService.getCart(userId);
    }

    @PutMapping("/{userId}")
    public CartDTO updateCart(@PathVariable String userId, @RequestBody CartDTO cartDTO) {
        return cartService.updateCart(userId, cartDTO);
    }

    @DeleteMapping("/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCart(@PathVariable String userId) {
        cartService.deleteCart(userId);
    }
}
