package domain

import (
	"context"
	"inventory-service/domain/models"
)

type ProductFilter struct {
	Name     string
	Category string
	PriceMin float64
	PriceMax float64
}

type ProductSort struct {
	Field string // e.g., "name", "price", "stock"
	Order int    // 1 for ascending, -1 for descending
}

type ProductRepository interface {
	Create(product *models.Product) error
	Update(product *models.Product) error
	Delete(id string) error
	FindByID(id string) (*models.Product, error)
	FindAll(ctx context.Context, filter ProductFilter, sort ProductSort, page, limit int) ([]*models.Product, int64, error) // Updated with filtering, sorting, paging
}
