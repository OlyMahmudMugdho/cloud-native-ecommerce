GCP_PROJECT=$(grep 'project' ~/cloud-native-ecommerce/infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
GCP_ZONE=$(grep 'zone' ~/cloud-native-ecommerce/infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
gcloud compute ssh mongodb-keycloak-server --zone="${GCP_ZONE}" --command='bash -s' <<EOF
sudo bash -c '
POSTGRES_HOST="${POSTGRES_HOST}"
KC_DB_USERNAME="${KC_DB_USERNAME}"
KC_DB_PASSWORD="${KC_DB_PASSWORD}"

# Create directories
mkdir -p /opt/infra /opt/keycloak/certs && cd /opt/infra

# Create docker-compose file
cat > docker-compose.yml <<COMPOSE

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
COMPOSE

# Start services
docker compose up -d
'
EOF
