package messaging

import (
	"context"
	"encoding/json"
	"log"

	"github.com/IBM/sarama"
)

type KafkaProducer struct {
	producer sarama.SyncProducer
	topic    string
}

func NewKafkaProducer(broker, topic string) *KafkaProducer {
	config := sarama.NewConfig()
	config.Producer.Return.Successes = true
	config.Producer.RequiredAcks = sarama.WaitForAll
	config.Producer.Retry.Max = 5

	producer, err := sarama.NewSyncProducer([]string{broker}, config)
	if err != nil {
		log.Fatalf("Failed to create Kafka producer: %v", err)
	}
	return &KafkaProducer{
		producer: producer,
		topic:    topic,
	}
}

type EmailMessage struct {
	Type    string `json:"type"`
	To      string `json:"to"`
	Token   string `json:"token"`
	Subject string `json:"subject"`
	Body    string `json:"body"`
}

func (p *KafkaProducer) SendEmailMessage(ctx context.Context, msg EmailMessage) error {
	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	_, _, err = p.producer.SendMessage(&sarama.ProducerMessage{
		Topic: p.topic,
		Value: sarama.ByteEncoder(data),
	})
	return err
}

func (p *KafkaProducer) Close() {
	p.producer.Close()
}
