package config

import (
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Port                string `yaml:"port"`
	MongoURL            string `yaml:"mongo_url"`
	CloudinaryCloudName string `yaml:"cloudinary_cloud_name"`
	CloudinaryAPIKey    string `yaml:"cloudinary_api_key"`
	CloudinaryAPISecret string `yaml:"cloudinary_api_secret"`
	EmailFrom           string `yaml:"email_from"`
	SMTPHost            string `yaml:"smtp_host"`
	SMTPPort            int    `yaml:"smtp_port"`
	SMTPUsername        string `yaml:"smtp_username"`
	SMTPPassword        string `yaml:"smtp_password"`
	ServiceAPIKey       string `yaml:"service_api_key"`
	RedisURL            string `yaml:"redis_url"`
	KafkaBroker         string `yaml:"kafka_broker"`
	KafkaEmailTopic     string `yaml:"kafka_email_topic"`
}

func LoadConfig(filename string) (*Config, error) {
	data, err := os.ReadFile(filename)
	if err != nil {
		return nil, err
	}

	var cfg Config
	err = yaml.Unmarshal(data, &cfg)
	if err != nil {
		return nil, err
	}

	return &cfg, nil
}
