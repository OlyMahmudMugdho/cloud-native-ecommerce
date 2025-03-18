package application

import (
	"inventory-service/domain"
	"inventory-service/domain/models"
)

type CategoryUsecase struct {
	repo domain.CategoryRepository
}

func NewCategoryUsecase(repo domain.CategoryRepository) *CategoryUsecase {
	return &CategoryUsecase{repo: repo}
}

func (u *CategoryUsecase) Create(category *models.Category) error {
	return u.repo.Create(category)
}

func (u *CategoryUsecase) Update(category *models.Category) error {
	return u.repo.Update(category)
}

func (u *CategoryUsecase) Delete(id string) error {
	return u.repo.Delete(id)
}

func (u *CategoryUsecase) GetByID(id string) (*models.Category, error) {
	return u.repo.FindByID(id)
}

func (u *CategoryUsecase) GetAll() ([]*models.Category, error) {
	return u.repo.FindAll()
}
