package com.mahmud.productservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahmud.productservice.dto.CartDTO;
import com.mahmud.productservice.dto.CartItemDTO;
import com.mahmud.productservice.dto.ProductDTO;
import com.mahmud.productservice.entity.Cart;
import com.mahmud.productservice.exception.InsufficientStockException;
import com.mahmud.productservice.exception.LockAcquisitionException;
import com.mahmud.productservice.exception.ResourceNotFoundException;
import com.mahmud.productservice.feign.InventoryServiceClient;
import com.mahmud.productservice.repository.CartRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class CartServiceImplTest {

    CartRepository cartRepository;
    RedisTemplate<String, String> redisTemplate;
    ValueOperations<String, String> valueOps;
    ObjectMapper objectMapper;
    InventoryServiceClient inventoryClient;
    CartServiceImpl cartService;

    @BeforeEach
    void setUp() {
        cartRepository = Mockito.mock(CartRepository.class);
        redisTemplate = Mockito.mock(RedisTemplate.class);
        valueOps = Mockito.mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        objectMapper = new ObjectMapper();
        inventoryClient = Mockito.mock(InventoryServiceClient.class);

        cartService = new CartServiceImpl(cartRepository, redisTemplate, objectMapper, inventoryClient);
    }

    @Test
    void addToCart_addsNewItem_whenStockAvailable() throws Exception {
        String userId = "user1";
        CartDTO input = new CartDTO();
        CartItemDTO item = new CartItemDTO();
        item.setProductId("p1");
        item.setQuantity(2);
        input.setItems(List.of(item));

        // lock acquired
    when(valueOps.setIfAbsent(eq("lock:cart:" + userId), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class))).thenReturn(true);
        // inventory returns product with stock 5
        ProductDTO p = new ProductDTO();
        p.setId("p1");
        p.setStock(5);
        when(inventoryClient.getProductById("p1")).thenReturn(p);

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());
        when(cartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CartDTO result = cartService.addToCart(userId, input);

        assertNotNull(result);
        assertEquals(userId, result.getUserId());
        assertEquals(1, result.getItems().size());
        verify(cartRepository, times(1)).save(any(Cart.class));
        verify(redisTemplate, times(1)).delete("lock:cart:" + userId);
    }

    @Test
    void addToCart_throwsInsufficientStock_whenNotEnough() {
        String userId = "user2";
        CartDTO input = new CartDTO();
        CartItemDTO item = new CartItemDTO();
        item.setProductId("p2");
        item.setQuantity(10);
        input.setItems(List.of(item));

    when(valueOps.setIfAbsent(eq("lock:cart:" + userId), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class))).thenReturn(true);
        ProductDTO p = new ProductDTO();
        p.setId("p2");
        p.setStock(3);
        when(inventoryClient.getProductById("p2")).thenReturn(p);

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class, () -> cartService.addToCart(userId, input));
    assertNotNull(ex.getCause());
    assertTrue(ex.getCause() instanceof InsufficientStockException);
    verify(redisTemplate, times(1)).delete("lock:cart:" + userId);
    }

    @Test
    void addToCart_throwsLockException_whenLockNotAcquired() {
        String userId = "u3";
        CartDTO input = new CartDTO();
        input.setItems(List.of());

    when(valueOps.setIfAbsent(eq("lock:cart:" + userId), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class))).thenReturn(false);

        assertThrows(LockAcquisitionException.class, () -> cartService.addToCart(userId, input));
    }

    @Test
    void getCart_returnsCart_whenExists() throws Exception {
        String userId = "userA";
        Cart cart = new Cart();
        cart.setId(5L);
        cart.setUserId(userId);
        CartItemDTO item = new CartItemDTO();
        item.setProductId("pX");
        item.setQuantity(1);
        cart.setItemsJson(objectMapper.writeValueAsString(List.of(item)));

        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));

        CartDTO dto = cartService.getCart(userId);

        assertNotNull(dto);
        assertEquals(5L, dto.getId());
        assertEquals(1, dto.getItems().size());
    }

    @Test
    void getCart_throwsNotFound_whenMissing() {
        String userId = "nope";
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.getCart(userId));
    }

    @Test
    void updateCart_updatesWhenStockOk() throws Exception {
        String userId = "upd";
        CartDTO input = new CartDTO();
        CartItemDTO item = new CartItemDTO();
        item.setProductId("p9");
        item.setQuantity(2);
        input.setItems(List.of(item));

    when(valueOps.setIfAbsent(eq("lock:cart:" + userId), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class))).thenReturn(true);
        ProductDTO p = new ProductDTO();
        p.setId("p9");
        p.setStock(10);
        when(inventoryClient.getProductById("p9")).thenReturn(p);

        Cart existing = new Cart();
        existing.setId(12L);
        existing.setUserId(userId);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(existing));

        when(cartRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CartDTO out = cartService.updateCart(userId, input);

        assertEquals(userId, out.getUserId());
        assertEquals(12L, out.getId());
        verify(redisTemplate, times(1)).delete("lock:cart:" + userId);
    }

    @Test
    void updateCart_throwsInsufficientStock_whenNotEnough() {
        String userId = "upd2";
        CartDTO input = new CartDTO();
        CartItemDTO item = new CartItemDTO();
        item.setProductId("pN");
        item.setQuantity(7);
        input.setItems(List.of(item));

    when(valueOps.setIfAbsent(eq("lock:cart:" + userId), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class))).thenReturn(true);
        ProductDTO p = new ProductDTO();
        p.setId("pN");
        p.setStock(2);
        when(inventoryClient.getProductById("pN")).thenReturn(p);

    RuntimeException ex = assertThrows(RuntimeException.class, () -> cartService.updateCart(userId, input));
    assertNotNull(ex.getCause());
    assertTrue(ex.getCause() instanceof InsufficientStockException);
    verify(redisTemplate, times(1)).delete("lock:cart:" + userId);
    }

    @Test
    void deleteCart_deletesWhenExists() {
        String userId = "del1";
    when(valueOps.setIfAbsent(eq("lock:cart:" + userId), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class))).thenReturn(true);
        Cart c = new Cart();
        c.setId(33L);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(c));

        cartService.deleteCart(userId);

        verify(cartRepository, times(1)).delete(c);
        verify(redisTemplate, times(1)).delete("lock:cart:" + userId);
    }

    @Test
    void deleteCart_throwsNotFound_whenMissing() {
        String userId = "delX";
    when(valueOps.setIfAbsent(eq("lock:cart:" + userId), anyString(), anyLong(), any(java.util.concurrent.TimeUnit.class))).thenReturn(true);
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> cartService.deleteCart(userId));
        verify(redisTemplate, times(1)).delete("lock:cart:" + userId);
    }
}
