GCP_ZONE=$(grep 'zone' ~/cloud-native-ecommerce/infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
./gcp_login.sh
KAFKA_IP=$(gcloud compute instances describe redis-kafka-server --zone=$GCP_ZONE --format=json | jq '.networkInterfaces.[0].accessConfigs.[0].natIP' -r) && \
gcloud compute ssh redis-kafka-server --zone="${GCP_ZONE}" --command='bash -s' <<EOF
sudo bash -c '
KAFKA_IP="${KAFKA_IP}"
mkdir -p /opt/infra && cd /opt/infra

cat > docker-compose.yml <<COMPOSE

volumes:
  zookeeper_data:
  zookeeper_logs:
  kafka_data:

networks:
  app-network:

services:
  redis:
    image: redis/redis-stack-server:latest
    container_name: redis
    ports:
      - "6379:6379"

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    hostname: zookeeper
    container_name: zookeeper
    ports:
      - "2181:2181"
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
      - zookeeper_logs:/var/lib/zookeeper/log
    networks:
      - app-network

  kafka:
    image: confluentinc/cp-kafka:7.3.13
    hostname: kafka
    container_name: kafka
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
      - "29092:29092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_HOST:PLAINTEXT
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://${KAFKA_IP}:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS: 0
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
    volumes:
      - kafka_data:/var/lib/kafka/data
    restart: always
    networks:
      - app-network
COMPOSE

docker compose up -d
'
EOF
