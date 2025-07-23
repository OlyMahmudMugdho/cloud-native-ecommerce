package application

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/services"
	"inventory-service/utils"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserUsecase struct {
	repo         domain.UserRepository
	emailService services.EmailService
}

func NewUserUsecase(repo domain.UserRepository, emailService services.EmailService) *UserUsecase {
	return &UserUsecase{repo: repo, emailService: emailService}
}

func (u *UserUsecase) Register(email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	otp := generateOTP(6)
	otpExpiry := time.Now().Add(15 * time.Minute)

	user := &models.User{
		Email:           email,
		Password:        string(hashedPassword),
		Role:            "user",
		IsVerified:      false,
		VerificationOTP: otp,
		OTPExpiry:       otpExpiry,
	}

	err = u.repo.Create(user)
	if err != nil {
		return err
	}

	return u.emailService.SendVerificationOTP(email, otp)
}

func (u *UserUsecase) Login(email, password string) (string, error) {
	user, err := u.repo.FindByEmail(email)
	if err != nil || user == nil || !user.IsVerified {
		return "", fmt.Errorf("invalid credentials or unverified email")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", fmt.Errorf("invalid credentials")
	}

	token, err := utils.GenerateJWT(user.ID.Hex(), user.Role)
	return token, err
}

func (u *UserUsecase) VerifyOTP(email, otp string) error {
	user, err := u.repo.FindByVerificationOTP(otp)
	if err != nil || user == nil || user.Email != email {
		return fmt.Errorf("invalid OTP or email")
	}

	if time.Now().After(user.OTPExpiry) {
		return fmt.Errorf("OTP expired")
	}

	user.IsVerified = true
	user.VerificationOTP = ""
	user.OTPExpiry = time.Time{}
	return u.repo.Update(user)
}

func (u *UserUsecase) RequestPasswordReset(email string) error {
	user, err := u.repo.FindByEmail(email)
	if err != nil || user == nil {
		return fmt.Errorf("user not found")
	}

	tokenBytes := make([]byte, 16)
	_, err = rand.Read(tokenBytes)
	if err != nil {
		return err
	}
	resetToken := hex.EncodeToString(tokenBytes)

	user.ResetToken = resetToken
	err = u.repo.Update(user)
	if err != nil {
		return err
	}

	return u.emailService.SendPasswordResetEmail(email, resetToken)
}

func (u *UserUsecase) ResetPassword(token, newPassword string) error {
	user, err := u.repo.FindByResetToken(token)
	if err != nil || user == nil {
		return fmt.Errorf("invalid or expired token")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	user.ResetToken = ""
	return u.repo.Update(user)
}

func generateOTP(length int) string {
	const charset = "0123456789"
	b := make([]byte, length)
	_, err := rand.Read(b)
	if err != nil {
		return ""
	}
	for i := range b {
		b[i] = charset[b[i]%byte(len(charset))]
	}
	return string(b)
}
