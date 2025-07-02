#!/bin/bash

# Configuration
REALM_NAME="cloud-native-ecommerce"
CLIENT_ID="product-service"
CLIENT_UUID="7223f767-afc8-4213-870a-f0a780a05c0b"
KEYCLOAK_URL="http://localhost:8088"
ADMIN_USER="admin"
ADMIN_PASS="admin"
USER_USERNAME="testuser"
USER_PASSWORD="password123"
USER_EMAIL="mugdhodzs38@gmail.com"
ROLE_NAME="USER"

echo ">>> Getting admin token..."
TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" | jq -r '.access_token')



echo ">>> Creating realm '$REALM_NAME' if not exists..."
REALM_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME" \
  -H "Authorization: Bearer $TOKEN")

if [ "$REALM_EXISTS" -ne 200 ]; then
  curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "realm": "'"$REALM_NAME"'",
      "enabled": true
    }'
  echo "Realm '$REALM_NAME' created."
else
  echo "Realm '$REALM_NAME' already exists."
fi




echo ">>> Creating client '$CLIENT_ID' if not exists..."
CLIENTS=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
  -H "Authorization: Bearer $TOKEN")

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
      "serviceAccountsEnabled": true,
      "standardFlowEnabled": false,
      "redirectUris": ["*"]
    }'
  echo "Client '$CLIENT_ID' created."

  # Fetch new client UUID
  CLIENT_UUID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients" \
    -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.clientId == "'"$CLIENT_ID"'") | .id')
else
  echo "Client '$CLIENT_ID' already exists."
fi





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
    "emailVerified": true,
    "credentials": [
      {
        "type": "password",
        "value": "'"$USER_PASSWORD"'",
        "temporary": false
      }
    ]
  }' > /dev/null

sleep 1  # wait a bit for the user to be available

echo ">>> Getting user ID..."
USER_ID=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users?username=$USER_USERNAME" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[0].id')

echo "User ID: $USER_ID"

echo ">>> Resetting user password..."
curl -s -X PUT "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$USER_ID/reset-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "password",
    "temporary": false,
    "value": "'"$USER_PASSWORD"'"
  }'


echo ">>> Creating role (if not exists)..."
# Create role only if not already present
ROLE_EXISTS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$ROLE_NAME" \
  -H "Authorization: Bearer $TOKEN")

if [ "$ROLE_EXISTS" -ne 200 ]; then
  curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name": "'"$ROLE_NAME"'", "description": "User role"}' > /dev/null
  echo "Role '$ROLE_NAME' created."
else
  echo "Role '$ROLE_NAME' already exists."
fi

echo ">>> Assigning role to user..."
ROLE_OBJ=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/roles/$ROLE_NAME" \
  -H "Authorization: Bearer $TOKEN")

curl -s -X POST "$KEYCLOAK_URL/admin/realms/$REALM_NAME/users/$USER_ID/role-mappings/realm" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "[$ROLE_OBJ]" > /dev/null

echo ">>> Getting client secret..."
CLIENT_SECRET=$(curl -s -X GET "$KEYCLOAK_URL/admin/realms/$REALM_NAME/clients/$CLIENT_UUID/client-secret" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.value')

echo ">>> Logging in as user..."

USER_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=$CLIENT_ID" \
  -d "username=$USER_USERNAME" \
  -d "password=$USER_PASSWORD" \
  -d "client_secret=$CLIENT_SECRET" \
  -d "scope=openid" | jq -r '.access_token')

echo -e "\n>>> User Access Token:\n$USER_TOKEN"
