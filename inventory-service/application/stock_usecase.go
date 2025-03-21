package application

import (
	"context"
	"inventory-service/domain"
)

type StockUsecase struct {
	repo domain.StockRepository
}

func NewStockUsecase(repo domain.StockRepository) *StockUsecase {
	return &StockUsecase{repo: repo}
}

func (uc *StockUsecase) BulkUpdateStock(ctx context.Context, updates map[string]struct {
	Quantity  int
	Increment bool
}) error {
	return uc.repo.BulkUpdateStock(ctx, updates)
}
