package com.mahmud.orderservice.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahmud.orderservice.dto.*;
import com.mahmud.orderservice.entity.Order;
import com.mahmud.orderservice.exception.InsufficientStockException;
import com.mahmud.orderservice.exception.LockAcquisitionException;
import com.mahmud.orderservice.exception.ResourceNotFoundException;
import com.mahmud.orderservice.feign.InventoryServiceClient;
import com.mahmud.orderservice.feign.ProductServiceClient;
import com.mahmud.orderservice.repository.OrderRepository;
import com.stripe.model.checkout.Session;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    OrderRepository orderRepository;

    @Mock
    ProductServiceClient productServiceClient;

    @Mock
    InventoryServiceClient inventoryServiceClient;

    @Mock
    StripeService stripeService;

    @Mock
    RedisTemplate<String, String> redisTemplate;

    @Mock
    ValueOperations<String, String> valueOperations;

    ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    OrderServiceImpl orderService;

    @Captor
    ArgumentCaptor<Order> orderCaptor;

    @BeforeEach
    void setUp() {
        // Create OrderServiceImpl with mocks; since @InjectMocks doesn't provide @Value fields, create manually
        orderService = new OrderServiceImpl(orderRepository, productServiceClient, inventoryServiceClient,
                stripeService, redisTemplate, objectMapper, "inv-key", "prod-key");

        // make lenient to avoid unnecessary stubbing failures in tests that don't use redis
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    void createCheckoutSession_success() throws Exception {
        String userId = "user-1";

        CartItemDTO item = new CartItemDTO();
        item.setProductId("p1");
        item.setQuantity(2);

        CartDTO cart = new CartDTO();
        cart.setUserId(userId);
        cart.setItems(List.of(item));

        ProductDTO product = new ProductDTO();
        product.setId("p1");
        product.setName("Prod1");
        product.setPrice(5.0);
        product.setStock(10);

        // Redis lock acquired
        given(valueOperations.setIfAbsent(anyString(), anyString(), anyLong(), any(TimeUnit.class))).willReturn(true);

        given(productServiceClient.getCart(eq(userId), anyString())).willReturn(cart);
        given(inventoryServiceClient.getProductById("p1")).willReturn(product);

        // Simulate orderRepository.save to set ID
        given(orderRepository.save(any(Order.class))).willAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            if (o.getId() == null) o.setId(1L);
            return o;
        });

        StripeResponse stripeResponse = StripeResponse.builder()
                .status("SUCCESS")
                .message("Payment session created")
                .sessionId("sess_123")
                .sessionUrl("https://example.com/checkout/sess_123")
                .build();

        given(stripeService.createCheckoutSession(anyList(), eq(userId), eq(1L))).willReturn(stripeResponse);

        StripeResponse result = orderService.createCheckoutSession(userId);

        assertThat(result).isNotNull();
        assertThat(result.getSessionId()).isEqualTo("sess_123");

        // Verify order saved twice (initial save + after setting session id)
        verify(orderRepository, atLeast(1)).save(orderCaptor.capture());
        verify(valueOperations).setIfAbsent(startsWith("lock:order:"), eq("locked"), eq(30L), any(TimeUnit.class));
        verify(redisTemplate).delete(startsWith("lock:order:"));
    }

    @Test
    void createCheckoutSession_lockFailure_throws() {
        String userId = "user-1";
        given(valueOperations.setIfAbsent(anyString(), anyString(), anyLong(), any(TimeUnit.class))).willReturn(false);

        assertThatThrownBy(() -> orderService.createCheckoutSession(userId))
                .isInstanceOf(LockAcquisitionException.class)
                .hasMessageContaining("Failed to acquire lock");

        verify(redisTemplate, never()).delete(anyString());
    }

    @Test
    void getOrder_success() throws Exception {
        Order order = new Order();
        order.setId(10L);
        order.setUserId("u1");
        order.setStatus("PENDING");
        order.setTotalAmount(12.5);

        CartItemDTO ci = new CartItemDTO();
        ci.setProductId("p1");
        ci.setQuantity(1);
        String itemsJson = objectMapper.writeValueAsString(List.of(ci));
        order.setItemsJson(itemsJson);

        given(orderRepository.findById(10L)).willReturn(Optional.of(order));

        OrderDTO dto = orderService.getOrder(10L, "u1");

        assertThat(dto).isNotNull();
        assertThat(dto.getId()).isEqualTo(10L);
        assertThat(dto.getItems()).hasSize(1);
        assertThat(dto.getTotalAmount()).isEqualTo(12.5);
    }

    @Test
    void getOrder_notFound_throws() {
        given(orderRepository.findById(999L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.getOrder(999L, "u1"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Order not found");
    }

    @Test
    void handleCheckoutSessionCompleted_paid_updatesStockAndOrder() throws Exception {
        // Prepare order saved with checkoutSessionId
        Order order = new Order();
        order.setId(5L);
        order.setUserId("u1");
        order.setStatus("PENDING");

        CartItemDTO ci = new CartItemDTO();
        ci.setProductId("p1");
        ci.setQuantity(2);
        order.setItemsJson(objectMapper.writeValueAsString(List.of(ci)));
        order.setCheckoutSessionId("sess_paid");

        given(orderRepository.findByCheckoutSessionId("sess_paid")).willReturn(Optional.of(order));

        ProductDTO product = new ProductDTO();
        product.setId("p1");
        product.setStock(10);
        product.setPrice(3.0);

        given(inventoryServiceClient.getProductById("p1")).willReturn(product);

        // inventoryServiceClient.updateStock does nothing (void)

        Session session = new Session();
        session.setId("sess_paid");
        session.setPaymentStatus("paid");

        orderService.handleCheckoutSessionCompleted(session);

        // Verify updateStock called
        verify(inventoryServiceClient).updateStock(any(StockUpdateDTO.class), eq("inv-key"));

        // Verify order status saved as PAID
        verify(orderRepository).save(argThat(o -> "PAID".equals(o.getStatus())));

        // Verify cart deleted in product service
        verify(productServiceClient).deleteCart(eq("u1"), anyString());
    }

    @Test
    void handleCheckoutSessionCompleted_insufficientStock_throws() throws Exception {
        Order order = new Order();
        order.setId(6L);
        order.setUserId("u2");
        order.setStatus("PENDING");

        CartItemDTO ci = new CartItemDTO();
        ci.setProductId("p2");
        ci.setQuantity(5);
        order.setItemsJson(objectMapper.writeValueAsString(List.of(ci)));
        order.setCheckoutSessionId("sess_insufficient");

        given(orderRepository.findByCheckoutSessionId("sess_insufficient")).willReturn(Optional.of(order));

        ProductDTO product = new ProductDTO();
        product.setId("p2");
        product.setStock(2); // not enough

        given(inventoryServiceClient.getProductById("p2")).willReturn(product);

        Session session = new Session();
        session.setId("sess_insufficient");
        session.setPaymentStatus("paid");

    assertThatThrownBy(() -> orderService.handleCheckoutSessionCompleted(session))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("Failed to process checkout session")
        .hasCauseInstanceOf(InsufficientStockException.class);
    }

    @Test
    void getAllOrders_success() throws Exception {
        Order o1 = new Order();
        o1.setId(1L);
        o1.setUserId("u1");
        o1.setStatus("PENDING");
        o1.setTotalAmount(10.0);
        CartItemDTO ci = new CartItemDTO();
        ci.setProductId("p1");
        ci.setQuantity(1);
        o1.setItemsJson(objectMapper.writeValueAsString(List.of(ci)));

        given(orderRepository.findByUserId("u1")).willReturn(List.of(o1));

        List<OrderDTO> results = orderService.getAllOrders("u1");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
    }

}
