package domain

import "inventory-service/domain/models"

type CategoryRepository interface {
	Create(category *models.Category) error
	Update(category *models.Category) error
	Delete(id string) error
	FindByID(id string) (*models.Category, error)
	FindAll() ([]*models.Category, error)
}
