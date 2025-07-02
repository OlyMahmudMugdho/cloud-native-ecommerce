package com.mahmud.orderservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mahmud.orderservice.service.OrderService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class StripeWebhookController {

    private final String webhookSecret;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    public StripeWebhookController(@Value("${stripe.webhook-secret}") String webhookSecret, 
                                  OrderService orderService, 
                                  ObjectMapper objectMapper) {
        this.webhookSecret = webhookSecret;
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/orders/webhook")
    public String handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            // Verify the event
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
            System.out.println("Received Stripe event: " + event.getType());

            // Handle the event
            switch (event.getType()) {
                case "checkout.session.completed":
                    System.out.println("-----Handling checkout.session.completed event-----");
                    EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
                    Session session = null;

                    // Try deserializing directly
                    if (dataObjectDeserializer.getObject().isPresent()) {
                        session = (Session) dataObjectDeserializer.getObject().get();
                        System.out.println("Session deserialized successfully: " + session.getId() + ", Payment Status: " + session.getPaymentStatus());
                    } else {
                        // Fallback to manual JSON parsing
                        System.out.println("Falling back to manual JSON parsing");
                        Map<String, Object> eventData = objectMapper.readValue(payload, Map.class);
                        Map<String, Object> dataObject = (Map<String, Object>) eventData.get("data");
                        Map<String, Object> sessionObject = (Map<String, Object>) dataObject.get("object");
                        
                        session = new Session();
                        session.setId((String) sessionObject.get("id"));
                        session.setPaymentStatus((String) sessionObject.get("payment_status"));
                        // Set metadata if needed
                        Map<String, String> metadata = (Map<String, String>) sessionObject.get("metadata");
                        session.setMetadata(metadata);
                        
                        System.out.println("Manually parsed session: " + session.getId() + ", Payment Status: " + session.getPaymentStatus());
                    }

                    orderService.handleCheckoutSessionCompleted(session);
                    break;
                case "checkout.session.expired":
                    System.out.println("Checkout session expired");
                    break;
                default:
                    System.out.println("Unhandled event type: " + event.getType());
            }

            return "Success";
        } catch (SignatureVerificationException e) {
            System.err.println("⚠️ Webhook error while validating signature: " + e.getMessage());
            return "Invalid signature";
        } catch (Exception e) {
            System.err.println("Error handling webhook: " + e.getMessage());
            return "Error";
        }
    }
}
