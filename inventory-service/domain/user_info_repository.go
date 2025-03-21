package domain

import (
	"context"
	"inventory-service/domain/models"
)

type UserInfoRepository interface {
	GetByID(ctx context.Context, id string) (*models.User, error)
	GetAll(ctx context.Context) ([]*models.User, error)
	Update(ctx context.Context, id string, user *models.User) (*models.User, error)
	Delete(ctx context.Context, id string) error
}
