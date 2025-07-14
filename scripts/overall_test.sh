#!/bin/bash

# Configuration
REALM_NAME="cloud-native-ecommerce"
CLIENT_ID="product-service"
KEYCLOAK_URL="https://34.48.185.178/"
ADMIN_USER="admin"
ADMIN_PASS="admin"
USER_USERNAME="testuser"
USER_PASSWORD="password123"
USER_EMAIL="mugdhodzs38@gmail.com"
ROLE_NAME="USER"

PRODUCT_SERVICE_URL="http://35.245.104.175"
ORDER_SERVICE_URL="http://35.245.104.175"
INVENTORY_SERVICE_URL="http://34.86.120.57"
PRODUCT_API_KEY="secret-api-key"
INVENTORY_API_KEY="secret-api-key"
PRODUCT_ID="68752b1c2b989286ccab3a91"
QUANTITY=2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Check dependencies
for dep in curl jq; do
  if ! command -v $dep &>/dev/null; then
    echo -e "${RED}Error: $dep is not installed${NC}"
    exit 1
  fi
done

echo ">>> Getting admin token..."
TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" --insecure | jq -r '.access_token')

# Create Realm
echo ">>> Creating realm if not exists..."
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME" \
  -H "Authorization: Bearer $TOKEN" --insecure)

if [ "$REALM_EXISTS" -ne 200 ]; then
  curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"realm":"'"$REALM_NAME"'","enabled":true}' --insecure
  echo "Realm created."
else
  echo "Realm already exists."
fi

# Create Client
echo ">>> Creating client if not exists..."
CLIENTS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $TOKEN" --insecure)
CLIENT_UUID=$(echo "$CLIENTS" | jq -r '.[] | select(.clientId == "'"$CLIENT_ID"'") | .id')

if [ -z "$CLIENT_UUID" ]; then
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "clientId": "'"$CLIENT_ID"'",
      "protocol": "openid-connect",
      "enabled": true,
      "publicClient": false,
      "directAccessGrantsEnabled": true,
      "standardFlowEnabled": false,
      "redirectUris": ["*"]
    }' --insecure
  CLIENT_UUID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.clientId == "'"$CLIENT_ID"'") | .id')
  echo "Client created."
else
  echo "Client already exists."
fi

# Create user
echo ">>> Creating user..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "'"$USER_USERNAME"'",
    "enabled": true,
    "firstName": "Test",
    "lastName": "User",
    "email": "'"$USER_EMAIL"'",
    "emailVerified": true
  }' --insecure > /dev/null

# Get user ID
sleep 1
USER_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=$USER_USERNAME" \
  -H "Authorization: Bearer $TOKEN" --insecure | jq -r '.[0].id')

# Set password
echo ">>> Resetting user password..."
curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$USER_ID/reset-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "password",
    "temporary": false,
    "value": "'"$USER_PASSWORD"'"
  }' --insecure

# Create role if needed
echo ">>> Creating role..."
ROLE_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$ROLE_NAME" \
  -H "Authorization: Bearer $TOKEN" --insecure)
if [ "$ROLE_EXISTS" -ne 200 ]; then
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"'"$ROLE_NAME"'","description":"User role"}' --insecure
fi

# Assign role
echo ">>> Assigning role..."
ROLE_OBJ=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$ROLE_NAME" \
  -H "Authorization: Bearer $TOKEN" --insecure)
curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "[$ROLE_OBJ]" --insecure

# Get client secret
echo ">>> Getting client secret..."
CLIENT_SECRET=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$CLIENT_UUID/client-secret" \
  -H "Authorization: Bearer $TOKEN" --insecure | jq -r '.value')

# Get user token
echo ">>> Logging in as user..."
USER_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=$CLIENT_ID" \
  -d "username=$USER_USERNAME" \
  -d "password=$USER_PASSWORD" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "scope=openid" --insecure | jq -r '.access_token')

if [ "$USER_TOKEN" == "null" ]; then
  echo -e "${RED}Failed to get user token.${NC}"
  exit 1
fi

# 🛒 Step 1: Add to cart
echo "Adding product $PRODUCT_ID to cart..."
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
      }" --insecure)

CART_ID=$(echo "$CART_RESPONSE" | jq -r '.id')
if [ "$CART_ID" == "null" ]; then
  echo -e "${RED}Failed to add product to cart${NC}"
  echo "$CART_RESPONSE"
  exit 1
fi
echo -e "${GREEN}Cart created: $CART_ID${NC}"

# 🧾 Step 2: Create checkout session
echo "Creating checkout session..."
CHECKOUT_RESPONSE=$(curl -s -X POST "$ORDER_SERVICE_URL/orders/checkout" \
  -H "accept: */*" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $USER_TOKEN")

SESSION_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.sessionId')
ORDER_ID=$(echo "$CHECKOUT_RESPONSE" | jq -r '.orderId')
if [ "$SESSION_ID" == "null" ] || [ "$ORDER_ID" == "null" ]; then
  echo -e "${RED}Invalid checkout response${NC}"
  echo "$CHECKOUT_RESPONSE"
  exit 1
fi
echo -e "${GREEN}Checkout created. Session ID: $SESSION_ID, Order ID: $ORDER_ID${NC}"


# ================================

# 🧾 Step 2: Create checkout session


# ================================

# # 💳 Step 3: Simulate payment
# echo "Simulating payment with Stripe CLI..."
# STRIPE_LOG=$(mktemp)
# stripe trigger checkout.session.completed > "$STRIPE_LOG" 2>&1 &
# STRIPE_PID=$!
# sleep 5
# if ! ps -p $STRIPE_PID > /dev/null; then
#   echo -e "${RED}Stripe simulation failed${NC}"
#   cat "$STRIPE_LOG"
#   rm "$STRIPE_LOG"
#   exit 1
# fi
# kill $STRIPE_PID 2>/dev/null
# rm "$STRIPE_LOG"
# echo -e "${GREEN}Payment simulated successfully${NC}"

# 📦 Step 4: Verify order status
echo "Verifying order status..."
ORDER_RESPONSE=$(curl -s -X GET "$ORDER_SERVICE_URL/orders/$ORDER_ID" \
  -H "accept: */*" \
  -H "Authorization: Bearer $USER_TOKEN")
ORDER_STATUS=$(echo "$ORDER_RESPONSE" | jq -r '.status')
if [ "$ORDER_STATUS" != "PAID" ]; then
  echo -e "${RED}Order status: $ORDER_STATUS (expected: PAID)${NC}"
  exit 1
fi
echo -e "${GREEN}Order status verified: $ORDER_STATUS${NC}"

# 🏪 Step 5: Check stock
echo "Checking inventory stock..."
STOCK_RESPONSE=$(curl -s -X GET "$INVENTORY_SERVICE_URL/inventory/api/products/$PRODUCT_ID" \
  -H "accept: */*" \
  -H "X-API-Key: $INVENTORY_API_KEY")
STOCK=$(echo "$STOCK_RESPONSE" | jq -r '.stock')
if [ "$STOCK" == "null" ]; then
  echo -e "${RED}Failed to get stock${NC}"
  exit 1
fi
echo -e "${GREEN}Inventory updated. Current stock: $STOCK${NC}"

echo -e "${GREEN}✅ Purchase flow completed successfully!${NC}"
