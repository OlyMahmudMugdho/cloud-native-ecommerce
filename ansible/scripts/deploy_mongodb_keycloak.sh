gcloud compute ssh mongodb-keycloak-server --zone="${GCP_ZONE}" --command='bash -s' <<EOF
sudo bash -c '
POSTGRES_HOST_IP="${POSTGRES_HOST_IP}"
KC_DB_USERNAME="${KC_DB_USERNAME}"
KC_DB_PASSWORD="${KC_DB_PASSWORD}"

mkdir -p /opt/infra && cd /opt/infra

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
      KC_HOSTNAME_STRICT_BACKCHANNEL: true
      KC_HTTP_RELATIVE_PATH: /
      KC_HTTP_ENABLED: true
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://${POSTGRES_HOST_IP}:5432/keycloak
      KC_DB_USERNAME: ${KC_DB_USERNAME}
      KC_DB_PASSWORD: ${KC_DB_PASSWORD}
    command:
      - start-dev
    ports:
      - "8088:8080"
    restart: unless-stopped
    networks:
      - app-network
COMPOSE

docker compose up -d
'
EOF
