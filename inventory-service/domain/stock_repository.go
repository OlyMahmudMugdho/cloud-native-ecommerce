package domain

import "context"

type StockRepository interface {
	BulkUpdateStock(ctx context.Context, updates map[string]struct {
		Quantity  int
		Increment bool
	}) error
}
