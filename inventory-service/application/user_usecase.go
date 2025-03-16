package application

import (
	"crypto/rand"
	"encoding/hex"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/services"
	"inventory-service/utils"

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

	tokenBytes := make([]byte, 16)
	_, err = rand.Read(tokenBytes)
	if err != nil {
		return err
	}
	verificationToken := hex.EncodeToString(tokenBytes)

	user := &models.User{
		Email:             email,
		Password:          string(hashedPassword),
		Role:              "user",
		IsVerified:        false,
		VerificationToken: verificationToken,
	}

	err = u.repo.Create(user)
	if err != nil {
		return err
	}

	return u.emailService.SendVerificationEmail(email, verificationToken)
}

func (u *UserUsecase) Login(email, password string) (string, error) {
	user, err := u.repo.FindByEmail(email)
	if err != nil || !user.IsVerified {
		return "", err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password))
	if err != nil {
		return "", err
	}

	token, err := utils.GenerateJWT(user.ID.Hex(), user.Role)
	return token, err
}

func (u *UserUsecase) VerifyEmail(token string) error {
	user, err := u.repo.FindByVerificationToken(token)
	if err != nil {
		return err
	}

	user.IsVerified = true
	user.VerificationToken = ""
	return u.repo.Update(user)
}

func (u *UserUsecase) RequestPasswordReset(email string) error {
	user, err := u.repo.FindByEmail(email)
	if err != nil {
		return err
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
	if err != nil {
		return err
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	user.Password = string(hashedPassword)
	user.ResetToken = ""
	return u.repo.Update(user)
}
