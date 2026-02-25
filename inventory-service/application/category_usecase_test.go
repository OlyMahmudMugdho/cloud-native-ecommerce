package application

import (
	"inventory-service/domain/models"
	"testing"
)

type mockCategoryRepository struct {
	createFunc   func(category *models.Category) error
	updateFunc   func(category *models.Category) error
	deleteFunc   func(id string) error
	findByIDFunc func(id string) (*models.Category, error)
	findAllFunc  func() ([]*models.Category, error)
}

func (m *mockCategoryRepository) Create(category *models.Category) error {
	if m.createFunc != nil {
		return m.createFunc(category)
	}
	return nil
}

func (m *mockCategoryRepository) Update(category *models.Category) error {
	if m.updateFunc != nil {
		return m.updateFunc(category)
	}
	return nil
}

func (m *mockCategoryRepository) Delete(id string) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(id)
	}
	return nil
}

func (m *mockCategoryRepository) FindByID(id string) (*models.Category, error) {
	if m.findByIDFunc != nil {
		return m.findByIDFunc(id)
	}
	return nil, nil
}

func (m *mockCategoryRepository) FindAll() ([]*models.Category, error) {
	if m.findAllFunc != nil {
		return m.findAllFunc()
	}
	return nil, nil
}

func TestCategoryUsecase(t *testing.T) {
	repo := &mockCategoryRepository{}
	usecase := NewCategoryUsecase(repo)

	t.Run("Create", func(t *testing.T) {
		repo.createFunc = func(category *models.Category) error {
			return nil
		}
		err := usecase.Create(&models.Category{})
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Update", func(t *testing.T) {
		repo.updateFunc = func(category *models.Category) error {
			return nil
		}
		err := usecase.Update(&models.Category{})
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
		expected := &models.Category{Name: "Test Category"}
		repo.findByIDFunc = func(id string) (*models.Category, error) {
			return expected, nil
		}
		c, err := usecase.GetByID("123")
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if c.Name != expected.Name {
			t.Errorf("expected %s, got %s", expected.Name, c.Name)
		}
	})

	t.Run("GetAll", func(t *testing.T) {
		repo.findAllFunc = func() ([]*models.Category, error) {
			return []*models.Category{{Name: "C1"}}, nil
		}
		categories, err := usecase.GetAll()
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if len(categories) != 1 {
			t.Errorf("expected 1, got %d", len(categories))
		}
		if categories[0].Name != "C1" {
			t.Errorf("expected C1, got %s", categories[0].Name)
		}
	})
}
