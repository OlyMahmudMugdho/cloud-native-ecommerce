package application

import (
	"context"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/dto"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type mockUserInfoRepository struct {
	getByIDFunc func(ctx context.Context, id string) (*models.User, error)
	getAllFunc  func(ctx context.Context) ([]*models.User, error)
	updateFunc  func(ctx context.Context, id string, user *models.User) (*models.User, error)
	deleteFunc  func(ctx context.Context, id string) error
}

func (m *mockUserInfoRepository) GetByID(ctx context.Context, id string) (*models.User, error) {
	if m.getByIDFunc != nil {
		return m.getByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *mockUserInfoRepository) GetAll(ctx context.Context) ([]*models.User, error) {
	if m.getAllFunc != nil {
		return m.getAllFunc(ctx)
	}
	return nil, nil
}

func (m *mockUserInfoRepository) Update(ctx context.Context, id string, user *models.User) (*models.User, error) {
	if m.updateFunc != nil {
		return m.updateFunc(ctx, id, user)
	}
	return nil, nil
}

func (m *mockUserInfoRepository) Delete(ctx context.Context, id string) error {
	if m.deleteFunc != nil {
		return m.deleteFunc(ctx, id)
	}
	return nil
}

func TestUserInfoUsecase(t *testing.T) {
	repo := &mockUserInfoRepository{}
	usecase := NewUserInfoUsecase(repo)
	ctx := context.Background()
	userID := primitive.NewObjectID()

	t.Run("GetByID", func(t *testing.T) {
		repo.getByIDFunc = func(ctx context.Context, id string) (*models.User, error) {
			return &models.User{ID: userID, Email: "test@example.com"}, nil
		}
		user, err := usecase.GetByID(ctx, userID.Hex())
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if user.Email != "test@example.com" {
			t.Errorf("expected test@example.com, got %s", user.Email)
		}
	})

	t.Run("GetAll", func(t *testing.T) {
		repo.getAllFunc = func(ctx context.Context) ([]*models.User, error) {
			return []*models.User{{ID: userID, Email: "test@example.com"}}, nil
		}
		users, err := usecase.GetAll(ctx)
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if len(users) != 1 {
			t.Errorf("expected 1, got %d", len(users))
		}
	})

	t.Run("Update", func(t *testing.T) {
		repo.getByIDFunc = func(ctx context.Context, id string) (*models.User, error) {
			return &models.User{ID: userID, Email: "old@example.com"}, nil
		}
		repo.updateFunc = func(ctx context.Context, id string, user *models.User) (*models.User, error) {
			return user, nil
		}

		req := &dto.UpdateUserRequest{Email: "new@example.com", Role: "admin", IsVerified: true}
		user, err := usecase.Update(ctx, userID.Hex(), req)
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if user.Email != "new@example.com" {
			t.Errorf("expected new@example.com, got %s", user.Email)
		}
		if user.Role != "admin" {
			t.Errorf("expected admin, got %s", user.Role)
		}
	})

	t.Run("Delete", func(t *testing.T) {
		repo.deleteFunc = func(ctx context.Context, id string) error {
			return nil
		}
		err := usecase.Delete(ctx, userID.Hex())
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})
}
