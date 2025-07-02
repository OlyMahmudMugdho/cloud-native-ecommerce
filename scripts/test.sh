#!/bin/bash

# Configuration
PRODUCT_SERVICE_URL="http://localhost:8081"
ORDER_SERVICE_URL="http://localhost:8082"
INVENTORY_SERVICE_URL="http://localhost:8083"
PRODUCT_API_KEY="secret-api-key"
INVENTORY_API_KEY="secret-api-key"
USER_TOKEN="your-jwt-token-here"
USER_ID="f395bdcf-d464-4722-800e-ecf48bcd6f2c"
PRODUCT_ID="683bd9ab5d01f2eb85c343fe"
QUANTITY=2
ORDER_ID=12

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
if ! command_exists curl; then
    echo -e "${RED}Error: curl is not installed${NC}"
    exit 1
fi
if ! command_exists jq; then
    echo -e "${RED}Error: jq is not installed${NC}"
    exit 1
fi
if ! command_exists stripe; then
    echo -e "${RED}Error: Stripe CLI is not installed${NC}"
    exit 1
fi

echo "Starting purchase flow automation..."

# Step 1: Add Product to Cart
echo "Adding product $PRODUCT_ID to cart for user $USER_ID..."
CART_RESPONSE=$(curl -s -X POST "$PRODUCT_SERVICE_URL/products/cart" \
    -H "accept: */*" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN" \
    -H "X-API-Key: $PRODUCT_API_KEY" \
    -d "{
          \"items\": [
            {
              \"productId\": \"$PRODUCT_ID\",
              \"quantity\": $QUANTITY
            }
          ]
        }")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to add product to cart${NC}"
    exit 1
fi

CART_ID=$(echo "$CART_RESPONSE" | jq -r '.id')
if [ "$CART_ID" == "null" ]; then
    echo -e "${RED}Error: Invalid cart response${NC}"
    echo "$CART_RESPONSE"
    exit 1
fi
echo -e "${GREEN}Product added to cart, Cart ID: $CART_ID${NC}"

# Step 2: Create Checkout Session
echo "Creating checkout session for user $USER_ID..."
CHECKOUT_RESPONSE=$(curl -s -X POST "$ORDER_SERVICE_URL/orders/checkout" \
    -H "accept: */*" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $USER_TOKEN")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to create checkout session${NC}"
    exit 1
fi

SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.sessionId')
if [ "$SESSION_ID" == "null" ]; then
    echo -e "${RED}Error: Invalid checkout session response${NC}"
    echo "$CHECKOUT_RESPONSE"
    exit 1
fi
echo -e "${GREEN}Checkout session created, Session ID: $SESSION_ID${NC}"

# Step 3: Simulate Payment Completion
echo "Simulating payment completion with Stripe CLI..."
STRIPE_LOG=$(mktemp)
stripe trigger checkout.session.completed > "$STRIPE_LOG" 2>&1 &
STRIPE_PID=$!

sleep 5

if ! ps -p $STRIPE_PID > /dev/null; then
    echo -e "${RED}Error: Stripe CLI failed${NC}"
    cat "$STRIPE_LOG"
    rm "$STRIPE_LOG"
    exit 1
fi

echo -e "${GREEN}Payment completion simulated${NC}"
kill $STRIPE_PID 2>/dev/null
rm "$STRIPE_LOG"

# Step 4: Verify Order Status
echo "Verifying order status for Order ID $ORDER_ID..."
ORDER_RESPONSE=$(curl -s -X GET "$ORDER_SERVICE_URL/orders/$ORDER_ID" \
    -H "accept: */*" \
    -H "Authorization: Bearer $USER_TOKEN")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to fetch order${NC}"
    exit 1
fi

ORDER_STATUS=$(echo "$ORDER_RESPONSE" | jq -r '.status')
if [ "$ORDER_STATUS" != "PAID" ]; then
    echo -e "${RED}Error: Order status is $ORDER_STATUS, expected PAID${NC}"
    echo "$ORDER_RESPONSE"
    exit 1
fi
echo -e "${GREEN}Order verified, Status: $ORDER_STATUS${NC}"

# Step 5: Check Inventory Stock
echo "Checking inventory stock for product $PRODUCT_ID..."
STOCK_RESPONSE=$(curl -s -X GET "$INVENTORY_SERVICE_URL/inventory/api/products/$PRODUCT_ID" \
    -H "accept: */*" \
    -H "X-API-Key: $INVENTORY_API_KEY")

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to fetch stock${NC}"
    exit 1
fi

STOCK=$(echo "$STOCK_RESPONSE" | jq -r '.stock')
if [ "$STOCK" == "null" ]; then
    echo -e "${RED}Error: Invalid stock response${NC}"
    echo "$STOCK_RESPONSE"
    exit 1
fi
echo -e "${GREEN}Stock updated, Current Stock: $STOCK${NC}"

echo -e "${GREEN}Purchase flow automation completed successfully!${NC}"
