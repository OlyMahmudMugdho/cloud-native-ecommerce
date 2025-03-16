package handlers

import (
	"encoding/json"
	"inventory-service/application"
	"inventory-service/infrastructure/dto"
	"inventory-service/infrastructure/services"
	"net/http"

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
	var updateDTO dto.UpdateProductDTO
	if err := json.NewDecoder(r.Body).Decode(&updateDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set the ID from URL before validation
	vars := mux.Vars(r)
	updateDTO.ID = vars["id"]

	// Validate after setting the ID
	if err := h.validator.Struct(updateDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	product := updateDTO.ToModel()

	err := h.usecase.Update(product)
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

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(product)
}

func (h *ProductHandler) GetAllProducts(w http.ResponseWriter, r *http.Request) {
	products, err := h.usecase.GetAll()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(products)
}
