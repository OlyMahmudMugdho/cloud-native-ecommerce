package services

import (
	"context"
	"fmt"
	"inventory-service/infrastructure/config"
	"inventory-service/infrastructure/messaging"
)

type EmailService interface {
	SendVerificationOTP(to, otp string) error
	SendPasswordResetEmail(to, token string) error
}

type emailService struct {
	kafkaProducer *messaging.KafkaProducer
	cfg           *config.Config
}

func NewEmailService(cfg *config.Config, kafkaProducer *messaging.KafkaProducer) EmailService {
	return &emailService{
		kafkaProducer: kafkaProducer,
		cfg:           cfg,
	}
}

func (s *emailService) SendVerificationOTP(to, otp string) error {
	msg := messaging.EmailMessage{
		Type:    "verification_otp",
		To:      to,
		Token:   otp,
		Subject: "Verify Your Email with OTP",
		Body:    fmt.Sprintf("Your verification OTP is: %s\nPlease use this code to verify your email. It expires in 15 minutes.", otp),
	}
	return s.kafkaProducer.SendEmailMessage(context.Background(), msg)
}

func (s *emailService) SendPasswordResetEmail(to, token string) error {
	msg := messaging.EmailMessage{
		Type:    "reset_password",
		To:      to,
		Token:   token,
		Subject: "Reset Your Password",
		Body:    fmt.Sprintf("Click the link to reset your password: http://localhost:%s/inventory/api/users/password/reset/%s", s.cfg.Port, token),
	}
	return s.kafkaProducer.SendEmailMessage(context.Background(), msg)
}
