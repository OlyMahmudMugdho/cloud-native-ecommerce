package handlers

import (
	"encoding/json"
	"inventory-service/application"
	"inventory-service/infrastructure/dto"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type StockHandler struct {
	usecase   *application.StockUsecase
	validator *validator.Validate
}

func NewStockHandler(usecase *application.StockUsecase) *StockHandler {
	return &StockHandler{
		usecase:   usecase,
		validator: validator.New(),
	}
}

func (h *StockHandler) BulkUpdateStock(w http.ResponseWriter, r *http.Request) {
	var req dto.BulkStockUpdateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(req); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	updates := make(map[string]struct {
		Quantity  int
		Increment bool
	})
	for _, p := range req.Products {
		updates[p.ProductID] = struct {
			Quantity  int
			Increment bool
		}{
			Quantity:  p.Quantity,
			Increment: p.Increment,
		}
	}

	if err := h.usecase.BulkUpdateStock(r.Context(), updates); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
