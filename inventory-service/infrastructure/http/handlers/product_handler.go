package handlers

import (
	"encoding/json"
	"inventory-service/application"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/dto"
	"inventory-service/infrastructure/services"
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"
	"github.com/gorilla/mux"
)

type ProductHandler struct {
	usecase       *application.ProductUsecase
	cloudinarySvc *services.CloudinaryService
	validator     *validator.Validate
}

func NewProductHandler(usecase *application.ProductUsecase, cloudinarySvc *services.CloudinaryService) *ProductHandler {
	return &ProductHandler{
		usecase:       usecase,
		cloudinarySvc: cloudinarySvc,
		validator:     validator.New(),
	}
}

func (h *ProductHandler) CreateProduct(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	var createDTO dto.CreateProductDTO
	err = json.Unmarshal([]byte(r.FormValue("product")), &createDTO)
	if err != nil {
		http.Error(w, "Invalid product data", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(createDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("image")
	if err != nil {
		http.Error(w, "Image required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	imageURL, err := h.cloudinarySvc.UploadImage(file)
	if err != nil {
		http.Error(w, "Failed to upload image", http.StatusInternalServerError)
		return
	}

	product := createDTO.ToModel()
	product.ImageURL = imageURL

	err = h.usecase.Create(product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) UpdateProduct(w http.ResponseWriter, r *http.Request) {
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}

	productJSON := r.FormValue("product")
	if productJSON == "" {
		http.Error(w, "Missing product data", http.StatusBadRequest)
		return
	}

	var updateDTO dto.UpdateProductDTO
	err = json.Unmarshal([]byte(productJSON), &updateDTO)
	if err != nil {
		http.Error(w, "Invalid product data", http.StatusBadRequest)
		return
	}

	vars := mux.Vars(r)
	updateDTO.ID = vars["id"]

	if err := h.validator.Struct(updateDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	product := updateDTO.ToModel()

	file, _, err := r.FormFile("image")
	if err == nil {
		imageURL, err := h.cloudinarySvc.UploadImage(file)
		if err != nil {
			http.Error(w, "Failed to upload image", http.StatusInternalServerError)
			return
		}
		product.ImageURL = imageURL
	} else {
		fetchedProduct, err := h.usecase.GetByID(updateDTO.ID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		if fetchedProduct == nil {
			http.Error(w, "Product not found", http.StatusNotFound)
			return
		}
		product.ImageURL = fetchedProduct.ImageURL
	}

	err = h.usecase.Update(product)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	err := h.usecase.Delete(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ProductHandler) GetProduct(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	product, err := h.usecase.GetByID(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	if product == nil {
		http.Error(w, "Product not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) GetAllProducts(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	filter := domain.ProductFilter{
		Name:     r.URL.Query().Get("name"),
		Category: r.URL.Query().Get("category"),
	}
	if priceMin := r.URL.Query().Get("price_min"); priceMin != "" {
		if val, err := strconv.ParseFloat(priceMin, 64); err == nil {
			filter.PriceMin = val
		}
	}
	if priceMax := r.URL.Query().Get("price_max"); priceMax != "" {
		if val, err := strconv.ParseFloat(priceMax, 64); err == nil {
			filter.PriceMax = val
		}
	}

	sort := domain.ProductSort{
		Field: r.URL.Query().Get("sort"), // e.g., "name", "price", "stock"
		Order: 1,                         // Default ascending
	}
	if order := r.URL.Query().Get("order"); order == "desc" {
		sort.Order = -1
	}

	page := 1
	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if val, err := strconv.Atoi(pageStr); err == nil && val > 0 {
			page = val
		}
	}

	limit := 10 // Default limit
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if val, err := strconv.Atoi(limitStr); err == nil && val > 0 {
			limit = val
		}
	}

	products, total, err := h.usecase.GetAll(r.Context(), filter, sort, page, limit)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Response structure with pagination metadata
	response := struct {
		Products   []*models.Product `json:"products"`
		Total      int64             `json:"total"`
		Page       int               `json:"page"`
		Limit      int               `json:"limit"`
		TotalPages int               `json:"total_pages"`
	}{
		Products:   products,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: int((total + int64(limit) - 1) / int64(limit)), // Ceiling division
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
