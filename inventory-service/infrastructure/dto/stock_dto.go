package dto

type BulkStockUpdateRequest struct {
	Products []struct {
		ProductID string `json:"productId" validate:"required"`
		Quantity  int    `json:"quantity" validate:"required,gte=0"`
		Increment bool   `json:"increment"` // True to increase stock, false to decrease
	} `json:"products" validate:"required,dive"`
}
