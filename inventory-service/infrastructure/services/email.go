package services

import (
	"fmt"
	"inventory-service/infrastructure/config"
	"net/smtp"
)

// EmailService defines the interface for email operations
type EmailService interface {
	SendVerificationEmail(to, token string) error
	SendPasswordResetEmail(to, token string) error
}

type emailService struct { // Renamed to avoid conflict with interface
	cfg *config.Config
}

func NewEmailService(cfg *config.Config) EmailService { // Return interface type
	return &emailService{cfg: cfg}
}

func (s *emailService) SendVerificationEmail(to, token string) error {
	auth := smtp.PlainAuth("", s.cfg.SMTPUsername, s.cfg.SMTPPassword, s.cfg.SMTPHost)
	msg := []byte(fmt.Sprintf("To: %s\r\n"+
		"Subject: Verify Your Email\r\n"+
		"\r\n"+
		"Click the link to verify your email: http://localhost:%s/users/verify/%s\r\n",
		to, s.cfg.Port, token))

	addr := fmt.Sprintf("%s:%d", s.cfg.SMTPHost, s.cfg.SMTPPort)
	return smtp.SendMail(addr, auth, s.cfg.EmailFrom, []string{to}, msg)
}

func (s *emailService) SendPasswordResetEmail(to, token string) error {
	auth := smtp.PlainAuth("", s.cfg.SMTPUsername, s.cfg.SMTPPassword, s.cfg.SMTPHost)
	msg := []byte(fmt.Sprintf("To: %s\r\n"+
		"Subject: Reset Your Password\r\n"+
		"\r\n"+
		"Click the link to reset your password: http://localhost:%s/users/password/reset/%s\r\n",
		to, s.cfg.Port, token))

	addr := fmt.Sprintf("%s:%d", s.cfg.SMTPHost, s.cfg.SMTPPort)
	return smtp.SendMail(addr, auth, s.cfg.EmailFrom, []string{to}, msg)
}
