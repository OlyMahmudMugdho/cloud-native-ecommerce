package application

import (
	"context"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"testing"
)

type mockProductRepository struct {
	createFunc   func(product *models.Product) error
	updateFunc   func(product *models.Product) error
	deleteFunc   func(id string) error
	findByIDFunc func(id string) (*models.Product, error)
	findAllFunc  func(ctx context.Context, filter domain.ProductFilter, sort domain.ProductSort, page, limit int) ([]*models.Product, int64, error)
}

func (m *mockProductRepository) Create(product *models.Product) error {
	if m.createFunc != nil {
		return m.createFunc(product)
	}
	return nil
}

func (m *mockProductRepository) Update(product *models.Product) error {
	if m.updateFunc != nil {
		return m.updateFunc(product)
	}
	return nil
}

func (m *mockProductRepository) Delete(id string) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(id)
	}
	return nil
}

func (m *mockProductRepository) FindByID(id string) (*models.Product, error) {
	if m.findByIDFunc != nil {
		return m.findByIDFunc(id)
	}
	return nil, nil
}

func (m *mockProductRepository) FindAll(ctx context.Context, filter domain.ProductFilter, sort domain.ProductSort, page, limit int) ([]*models.Product, int64, error) {
	if m.findAllFunc != nil {
		return m.findAllFunc(ctx, filter, sort, page, limit)
	}
	return nil, 0, nil
}

func TestProductUsecase(t *testing.T) {
	repo := &mockProductRepository{}
	usecase := NewProductUsecase(repo)

	t.Run("Create", func(t *testing.T) {
		repo.createFunc = func(product *models.Product) error {
			return nil
		}
		err := usecase.Create(&models.Product{})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Update", func(t *testing.T) {
		repo.updateFunc = func(product *models.Product) error {
			return nil
		}
		err := usecase.Update(&models.Product{})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Delete", func(t *testing.T) {
		repo.deleteFunc = func(id string) error {
			return nil
		}
		err := usecase.Delete("123")
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("GetByID", func(t *testing.T) {
		expected := &models.Product{Name: "Test Product"}
		repo.findByIDFunc = func(id string) (*models.Product, error) {
			return expected, nil
		}
		p, err := usecase.GetByID("123")
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if p.Name != expected.Name {
			t.Errorf("expected %s, got %s", expected.Name, p.Name)
		}
	})

	t.Run("GetAll", func(t *testing.T) {
		repo.findAllFunc = func(ctx context.Context, filter domain.ProductFilter, sort domain.ProductSort, page, limit int) ([]*models.Product, int64, error) {
			return []*models.Product{{Name: "P1"}}, 1, nil
		}
		products, total, err := usecase.GetAll(context.Background(), domain.ProductFilter{}, domain.ProductSort{}, 1, 10)
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if total != 1 {
			t.Errorf("expected 1, got %d", total)
		}
		if products[0].Name != "P1" {
			t.Errorf("expected P1, got %s", products[0].Name)
		}
	})
}
