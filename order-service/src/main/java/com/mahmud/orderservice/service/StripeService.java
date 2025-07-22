package com.mahmud.orderservice.service;

import com.mahmud.orderservice.dto.CartItemDTO;
import com.mahmud.orderservice.dto.ProductDTO;
import com.mahmud.orderservice.dto.StripeResponse;
import com.mahmud.orderservice.feign.InventoryServiceClient;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StripeService {

    private final String secretKey;
    private final InventoryServiceClient inventoryServiceClient;

    public StripeService(@Value("${stripe.secretKey}") String secretKey, InventoryServiceClient inventoryServiceClient) {
        this.secretKey = secretKey;
        this.inventoryServiceClient = inventoryServiceClient;
    }

    public StripeResponse createCheckoutSession(List<CartItemDTO> items, String userId, Long orderId) {
        Stripe.apiKey = secretKey;

        try {
            // Create line items for each cart item
            List<SessionCreateParams.LineItem> lineItems = items.stream().map(item -> {
                ProductDTO product = inventoryServiceClient.getProductById(item.getProductId());
                if (product == null) {
                    throw new RuntimeException("Product not found: " + item.getProductId());
                }

                SessionCreateParams.LineItem.PriceData.ProductData productData =
                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                .setName(product.getName())
                                .build();

                SessionCreateParams.LineItem.PriceData priceData =
                        SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("usd")
                                .setUnitAmount((long) (product.getPrice() * 100)) // Convert to cents
                                .setProductData(productData)
                                .build();

                return SessionCreateParams.LineItem.builder()
                        .setQuantity((long) item.getQuantity())
                        .setPriceData(priceData)
                        .build();
            }).toList();

            // Create checkout session
            SessionCreateParams params =
                    SessionCreateParams.builder()
                            .setMode(SessionCreateParams.Mode.PAYMENT)
                            .setSuccessUrl("https://cloud-native-ecommerce.netlify.app/payment-success")
                            .setCancelUrl("https://cloud-native-ecommerce.netlify.app/payment-cancel")
                            .setInvoiceCreation(SessionCreateParams.InvoiceCreation.builder().setEnabled(true).build())
                            .addAllLineItem(lineItems)
                            .putMetadata("app_username", userId)
                            .putMetadata("order_id", orderId.toString())
                            .build();

            Session session = Session.create(params);

            return StripeResponse.builder()
                    .status("SUCCESS")
                    .message("Payment session created")
                    .sessionId(session.getId())
                    .sessionUrl(session.getUrl())
                    .build();
        } catch (StripeException e) {
            throw new RuntimeException("Failed to create Stripe session: " + e.getMessage(), e);
        }
    }
}