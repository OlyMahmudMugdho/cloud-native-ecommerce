package application

import (
	"context"
	"testing"
)

type mockStockRepository struct {
	bulkUpdateFunc func(ctx context.Context, updates map[string]struct {
		Quantity  int
		Increment bool
	}) error
}

func (m *mockStockRepository) BulkUpdateStock(ctx context.Context, updates map[string]struct {
	Quantity  int
	Increment bool
}) error {
	if m.bulkUpdateFunc != nil {
		return m.bulkUpdateFunc(ctx, updates)
	}
	return nil
}

func TestStockUsecase(t *testing.T) {
	repo := &mockStockRepository{}
	usecase := NewStockUsecase(repo)

	t.Run("BulkUpdateStock", func(t *testing.T) {
		repo.bulkUpdateFunc = func(ctx context.Context, updates map[string]struct {
			Quantity  int
			Increment bool
		}) error {
			return nil
		}
		err := usecase.BulkUpdateStock(context.Background(), nil)
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})
}
