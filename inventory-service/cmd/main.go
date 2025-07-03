package main

import (
	"context"
	"encoding/json"
	"fmt"
	"inventory-service/infrastructure/cache"
	"inventory-service/infrastructure/config"
	"inventory-service/infrastructure/db"
	"inventory-service/infrastructure/http/routes"
	"inventory-service/infrastructure/messaging"
	"inventory-service/infrastructure/services"
	"log"
	"net/http"
	"net/smtp"

	"github.com/IBM/sarama"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	
	fmt.Println(cfg.MongoURL)

	// Initialize MongoDB
	mongoClient, err := db.NewMongoClient(cfg.MongoURL)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect()

	// Initialize Redis
	redisClient, err := cache.NewRedisClient(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer redisClient.Disconnect()

	// Initialize Kafka Producer
	kafkaProducer := messaging.NewKafkaProducer(cfg.KafkaBroker, cfg.KafkaEmailTopic)
	defer kafkaProducer.Close()

	// Start Kafka Consumer in a goroutine
	go startKafkaEmailConsumer(cfg)

	// Register with Eureka Server
	services.RegisterWithEureka()
	go services.SendHeartbeat()

	// Setup and start HTTP server using routes.SetupRouter
	router := routes.SetupRouter(mongoClient, cfg, kafkaProducer, redisClient) // Pass redisClient
	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, router))

}

// Kafka Email Consumer Logic
type emailConsumerHandler struct {
	cfg *config.Config
}

func (h *emailConsumerHandler) Setup(sarama.ConsumerGroupSession) error   { return nil }
func (h *emailConsumerHandler) Cleanup(sarama.ConsumerGroupSession) error { return nil }

func (h *emailConsumerHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for msg := range claim.Messages() {
		var emailMsg messaging.EmailMessage
		if err := json.Unmarshal(msg.Value, &emailMsg); err != nil {
			log.Printf("Failed to unmarshal message: %v", err)
			continue
		}

		auth := smtp.PlainAuth("", h.cfg.SMTPUsername, h.cfg.SMTPPassword, h.cfg.SMTPHost)
		smtpMsg := []byte(fmt.Sprintf("To: %s\r\nSubject: %s\r\n\r\n%s\r\n", emailMsg.To, emailMsg.Subject, emailMsg.Body))
		addr := fmt.Sprintf("%s:%d", h.cfg.SMTPHost, h.cfg.SMTPPort)

		if err := smtp.SendMail(addr, auth, h.cfg.EmailFrom, []string{emailMsg.To}, smtpMsg); err != nil {
			log.Printf("Failed to send email to %s: %v", emailMsg.To, err)
		} else {
			log.Printf("Email sent to %s", emailMsg.To)
		}
		session.MarkMessage(msg, "")
	}
	return nil
}

func startKafkaEmailConsumer(cfg *config.Config) {
	config := sarama.NewConfig()
	config.Consumer.Group.Rebalance.Strategy = sarama.BalanceStrategyRoundRobin
	config.Consumer.Offsets.Initial = sarama.OffsetOldest

	consumerGroup, err := sarama.NewConsumerGroup([]string{cfg.KafkaBroker}, "email-consumer-group", config)
	if err != nil {
		log.Fatalf("Failed to create consumer group: %v", err)
	}
	defer consumerGroup.Close()

	handler := &emailConsumerHandler{cfg: cfg}
	ctx := context.Background()

	for {
		err := consumerGroup.Consume(ctx, []string{cfg.KafkaEmailTopic}, handler)
		if err != nil {
			log.Printf("Error consuming messages: %v", err)
		}
	}
}
