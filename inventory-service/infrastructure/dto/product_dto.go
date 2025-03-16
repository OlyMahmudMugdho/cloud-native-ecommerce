package dto

import (
	"inventory-service/domain/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CreateProductDTO struct {
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Price       float64 `json:"price" validate:"required,gt=0"`
	Stock       int     `json:"stock" validate:"required,gte=0"`
}

type UpdateProductDTO struct {
	ID          string  `json:"-" validate:"required"`
	Name        string  `json:"name" validate:"required"`
	Description string  `json:"description" validate:"required"`
	Price       float64 `json:"price" validate:"required,gt=0"`
	Stock       int     `json:"stock" validate:"required,gte=0"`
}

func (dto *CreateProductDTO) ToModel() *models.Product {
	return &models.Product{
		Name:        dto.Name,
		Description: dto.Description,
		Price:       dto.Price,
		Stock:       dto.Stock,
	}
}

func (dto *UpdateProductDTO) ToModel() *models.Product {
	id, _ := primitive.ObjectIDFromHex(dto.ID)
	return &models.Product{
		ID:          id,
		Name:        dto.Name,
		Description: dto.Description,
		Price:       dto.Price,
		Stock:       dto.Stock,
	}
}
