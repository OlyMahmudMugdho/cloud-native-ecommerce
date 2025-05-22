package com.mahmud.orderservice.controller;

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

@RestController
public class StripeWebhookController {

    private final String webhookSecret;
    private final OrderService orderService;

    public StripeWebhookController(@Value("${stripe.webhookSecret}") String webhookSecret, OrderService orderService) {
        this.webhookSecret = webhookSecret;
        this.orderService = orderService;
    }

    @PostMapping("/orders/webhook")
    public String handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        try {
            // Verify the event
            Event event = Webhook.constructEvent(payload, sigHeader, webhookSecret);

            // Handle the event
            switch (event.getType()) {
                case "checkout.session.completed":
                    EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
                    if (dataObjectDeserializer.getObject().isPresent()) {
                        Session session = (Session) dataObjectDeserializer.getObject().get();
                        orderService.handleCheckoutSessionCompleted(session);
                    }
                    break;
                default:
                    System.out.println("Unhandled event type: " + event.getType());
            }

            return "Success";
        } catch (SignatureVerificationException e) {
            System.err.println("⚠️ Webhook error while validating signature.");
            return "Invalid signature";
        } catch (Exception e) {
            System.err.println("Error handling webhook: " + e.getMessage());
            return "Error";
        }
    }
}