package domain

import "inventory-service/domain/models"

type ProductRepository interface {
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(id string) error
	FindByID(id string) (*models.Product, error)
	FindAll() ([]*models.Product, error)
}
