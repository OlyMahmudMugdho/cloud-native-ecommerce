package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port                string
	MongoURL            string
	CloudinaryCloudName string
	CloudinaryAPIKey    string
	CloudinaryAPISecret string
	EmailFrom           string
	SMTPHost            string
	SMTPPort            int
	SMTPUsername        string
	SMTPPassword        string
	ServiceAPIKey       string
	RedisURL            string
	KafkaBroker         string
	KafkaEmailTopic     string
	InventoryHost 		string
}

func LoadConfig() (*Config, error) {
	cfg := &Config{
		Port:                os.Getenv("PORT"),
		MongoURL:            os.Getenv("MONGO_URL"),
		CloudinaryCloudName: os.Getenv("CLOUDINARY_CLOUD_NAME"),
		CloudinaryAPIKey:    os.Getenv("CLOUDINARY_API_KEY"),
		CloudinaryAPISecret: os.Getenv("CLOUDINARY_API_SECRET"),
		EmailFrom:           os.Getenv("EMAIL_FROM"),
		SMTPHost:            os.Getenv("SMTP_HOST"),
		SMTPUsername:        os.Getenv("SMTP_USERNAME"),
		SMTPPassword:        os.Getenv("SMTP_PASSWORD"),
		ServiceAPIKey:       os.Getenv("SERVICE_API_KEY"),
		RedisURL:            os.Getenv("REDIS_URL"),
		KafkaBroker:         os.Getenv("KAFKA_BROKER"),
		KafkaEmailTopic:     os.Getenv("KAFKA_EMAIL_TOPIC"),
		InventoryHost:		 os.Getenv("INVENTORY_HOST")
	}

	// Parse SMTP_PORT from string to int
	if smtpPortStr := os.Getenv("SMTP_PORT"); smtpPortStr != "" {
		if port, err := strconv.Atoi(smtpPortStr); err == nil {
			cfg.SMTPPort = port
		} else {
			return nil, err
		}
	}

	return cfg, nil
}
