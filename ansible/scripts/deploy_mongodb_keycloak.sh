GCP_PROJECT=$(grep 'project' ../../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
GCP_ZONE=$(grep 'zone' ../../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
POSTGRES_HOST_IP=$(gcloud sql instances describe database-instance --format=json | jq '.ipAddresses.[0].ipAddress' -r) && \
KC_DB_USERNAME="mugdho" && \
KC_DB_PASSWORD="admin" && \
gcloud compute ssh mongodb-keycloak-server --zone="${GCP_ZONE}" --command='bash -s' <<EOF
sudo bash -c '
POSTGRES_HOST_IP="${POSTGRES_HOST_IP}"
KC_DB_USERNAME="${KC_DB_USERNAME}"
KC_DB_PASSWORD="${KC_DB_PASSWORD}"

# Create directories
mkdir -p /opt/infra /opt/keycloak/certs && cd /opt/infra

# Generate self-signed cert
openssl req -x509 -newkey rsa:4096 -nodes \
  -keyout /opt/keycloak/certs/keycloak.key \
  -out /opt/keycloak/certs/keycloak.crt \
  -days 365 \
  -subj "/CN=keycloak.local"

# Fix file permissions so Keycloak can read the certs
chown 1000:1000 /opt/keycloak/certs/keycloak.key /opt/keycloak/certs/keycloak.crt
chmod 640 /opt/keycloak/certs/keycloak.key
chmod 644 /opt/keycloak/certs/keycloak.crt


# Create docker-compose file
cat > docker-compose.yml <<COMPOSE
version: "3.9"

volumes:
  mongodb_data:

networks:
  app-network:

services:
  mongodb:
    image: mongodb/mongodb-community-server:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    restart: unless-stopped
    volumes:
      - mongodb_data:/data/db
    networks:
      - app-network

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: keycloak
    environment:
      KC_BOOTSTRAP_ADMIN_USERNAME: admin
      KC_BOOTSTRAP_ADMIN_PASSWORD: admin
      KC_HOSTNAME_STRICT_BACKCHANNEL: false
      KC_HTTP_ENABLED: false
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://${POSTGRES_HOST_IP}:5432/keycloak
      KC_DB_USERNAME: ${KC_DB_USERNAME}
      KC_DB_PASSWORD: ${KC_DB_PASSWORD}
      KC_HTTPS_CERTIFICATE_FILE: /opt/certs/keycloak.crt
      KC_HTTPS_CERTIFICATE_KEY_FILE: /opt/certs/keycloak.key
      KC_HTTPS_PORT: 8443
      KC_HOSTNAME_STRICT: false
    command:
      - start
    ports:
      - "8443:8443"
    volumes:
      - /opt/keycloak/certs:/opt/certs:ro
    restart: unless-stopped
    networks:
      - app-network
COMPOSE

# Start services
docker compose up -d
'
EOF
