package com.mahmud.productservice.service;

import com.mahmud.productservice.dto.CartDTO;
import com.mahmud.productservice.dto.CartItemDTO;
import com.mahmud.productservice.dto.ProductDTO;
import com.mahmud.productservice.entity.Cart;
import com.mahmud.productservice.exception.InsufficientStockException;
import com.mahmud.productservice.exception.LockAcquisitionException;
import com.mahmud.productservice.exception.ResourceNotFoundException;
import com.mahmud.productservice.feign.InventoryServiceClient;
import com.mahmud.productservice.repository.CartRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final InventoryServiceClient inventoryServiceClient;

    public CartServiceImpl(CartRepository cartRepository, RedisTemplate<String, String> redisTemplate,
                           ObjectMapper objectMapper, InventoryServiceClient inventoryServiceClient) {
        this.cartRepository = cartRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.inventoryServiceClient = inventoryServiceClient;
    }

    @Override
    @Transactional
    public CartDTO addToCart(String userId, CartDTO cartDTO) {
        String lockKey = "lock:cart:" + userId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", 30, TimeUnit.SECONDS);
        if (locked == null || !locked) {
            throw new LockAcquisitionException("Failed to acquire lock for cart: " + userId);
        }
        try {
            // Get existing cart or create a new one
            Cart cart = cartRepository.findByUserId(userId)
                    .orElse(new Cart());
            cart.setUserId(userId); // Always use the userId from JWT

            // Parse existing items from cart (if any)
            List<CartItemDTO> existingItems = new ArrayList<>();
            if (cart.getItemsJson() != null && !cart.getItemsJson().isEmpty()) {
                existingItems = objectMapper.readValue(cart.getItemsJson(),
                        objectMapper.getTypeFactory().constructCollectionType(List.class, CartItemDTO.class));
            }

            // Process new items from cartDTO
            List<CartItemDTO> newItems = cartDTO.getItems();
            for (CartItemDTO newItem : newItems) {
                ProductDTO product = inventoryServiceClient.getProductById(newItem.getProductId());
                if (product == null) {
                    throw new ResourceNotFoundException("Product not found with id: " + newItem.getProductId());
                }

                // Check if the product already exists in the cart
                Optional<CartItemDTO> existingItemOpt = existingItems.stream()
                        .filter(item -> item.getProductId().equals(newItem.getProductId()))
                        .findFirst();

                if (existingItemOpt.isPresent()) {
                    // Increment quantity if product exists
                    CartItemDTO existingItem = existingItemOpt.get();
                    int updatedQuantity = existingItem.getQuantity() + newItem.getQuantity();
                    if (product.getStock() < updatedQuantity) {
                        throw new InsufficientStockException("Insufficient stock for product " + newItem.getProductId() +
                                ". Available: " + product.getStock() + ", Requested: " + updatedQuantity);
                    }
                    existingItem.setQuantity(updatedQuantity);
                } else {
                    // Add new item if it doesn’t exist
                    if (product.getStock() < newItem.getQuantity()) {
                        throw new InsufficientStockException("Insufficient stock for product " + newItem.getProductId() +
                                ". Available: " + product.getStock() + ", Requested: " + newItem.getQuantity());
                    }
                    existingItems.add(newItem);
                }
            }

            // Save updated items back to cart
            cart.setItemsJson(objectMapper.writeValueAsString(existingItems));
            cartRepository.save(cart);

            // Prepare response DTO
            CartDTO responseDTO = new CartDTO();
            responseDTO.setId(cart.getId());
            responseDTO.setUserId(userId); // Use JWT userId in response
            responseDTO.setItems(existingItems);
            return responseDTO;
        } catch (Exception e) {
            throw new RuntimeException("Failed to add to cart: " + e.getMessage(), e);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    
    
    @Override
@Transactional(readOnly = true)
public CartDTO getCart(String userId) {
    System.out.println("Fetching cart for userId: " + userId);
    Cart cart = cartRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));
    try {
        CartDTO cartDTO = new CartDTO();
        cartDTO.setId(cart.getId());
        cartDTO.setUserId(cart.getUserId());
        cartDTO.setItems(objectMapper.readValue(cart.getItemsJson(), objectMapper.getTypeFactory().constructCollectionType(List.class, CartItemDTO.class)));
        System.out.println("Cart found: " + cartDTO);
        return cartDTO;
    } catch (Exception e) {
        throw new RuntimeException("Failed to parse cart items: " + e.getMessage(), e);
    }
}



    @Override
    @Transactional
    public CartDTO updateCart(String userId, CartDTO cartDTO) {
        String lockKey = "lock:cart:" + userId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", 30, TimeUnit.SECONDS);
        if (locked == null || !locked) {
            throw new LockAcquisitionException("Failed to acquire lock for cart: " + userId);
        }
        try {
            // Check inventory for each item in the updated cart
            List<CartItemDTO> items = cartDTO.getItems();
            for (CartItemDTO item : items) {
                ProductDTO product = inventoryServiceClient.getProductById(item.getProductId());
                if (product == null) {
                    throw new ResourceNotFoundException("Product not found with id: " + item.getProductId());
                }
                if (product.getStock() < item.getQuantity()) {
                    throw new InsufficientStockException("Insufficient stock for product " + item.getProductId() +
                            ". Available: " + product.getStock() + ", Requested: " + item.getQuantity());
                }
            }

            // If inventory checks pass, proceed with updating cart
            Cart cart = cartRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));
            cart.setUserId(userId); // Ensure userId from JWT is used
            cart.setItemsJson(objectMapper.writeValueAsString(cartDTO.getItems()));
            cartRepository.save(cart);

            // Prepare response DTO
            cartDTO.setId(cart.getId());
            cartDTO.setUserId(userId); // Use JWT userId in response
            return cartDTO;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update cart: " + e.getMessage(), e);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Override
    @Transactional
    public void deleteCart(String userId) {
        String lockKey = "lock:cart:" + userId;
        Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, "locked", 30, TimeUnit.SECONDS);
        if (locked == null || !locked) {
            throw new LockAcquisitionException("Failed to acquire lock for cart: " + userId);
        }
        try {
            Cart cart = cartRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user: " + userId));
            cartRepository.delete(cart);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }
}