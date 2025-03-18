package dto

import (
	"inventory-service/domain/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type CreateCategoryDTO struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description" validate:"required"`
}

type UpdateCategoryDTO struct {
	ID          string `json:"-" validate:"required"`
	Name        string `json:"name" validate:"required"`
	Description string `json:"description" validate:"required"`
}

func (dto *CreateCategoryDTO) ToModel() *models.Category {
	return &models.Category{
		Name:        dto.Name,
		Description: dto.Description,
	}
}

func (dto *UpdateCategoryDTO) ToModel() *models.Category {
	id, _ := primitive.ObjectIDFromHex(dto.ID)
	return &models.Category{
		ID:          id,
		Name:        dto.Name,
		Description: dto.Description,
	}
}
