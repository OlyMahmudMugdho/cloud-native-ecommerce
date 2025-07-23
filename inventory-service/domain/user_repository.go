package domain

import "inventory-service/domain/models"

type UserRepository interface {
	Create(user *models.User) error
	FindByEmail(email string) (*models.User, error)
	FindByID(id string) (*models.User, error)
	Update(user *models.User) error
	FindByVerificationOTP(otp string) (*models.User, error)
	FindByResetToken(token string) (*models.User, error)
}
