package application

import (
	"inventory-service/domain"
	"inventory-service/domain/models"
)

type ProductUsecase struct {
	repo domain.ProductRepository
}

func NewProductUsecase(repo domain.ProductRepository) *ProductUsecase {
	return &ProductUsecase{repo: repo}
}

func (u *ProductUsecase) Create(product *models.Product) error {
	return u.repo.Create(product)
}

func (u *ProductUsecase) Update(product *models.Product) error {
	return u.repo.Update(product)
}

func (u *ProductUsecase) Delete(id string) error {
	return u.repo.Delete(id)
}

func (u *ProductUsecase) GetByID(id string) (*models.Product, error) {
	return u.repo.FindByID(id)
}

func (u *ProductUsecase) GetAll() ([]*models.Product, error) {
	return u.repo.FindAll()
}
