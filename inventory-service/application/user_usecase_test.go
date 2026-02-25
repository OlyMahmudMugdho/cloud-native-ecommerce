package application

import (
	"errors"
	"inventory-service/domain/models"
	"testing"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)

type mockUserRepository struct {
	createFunc       func(user *models.User) error
	findByEmail      func(email string) (*models.User, error)
	findByID         func(id string) (*models.User, error)
	findByOTP        func(otp string) (*models.User, error)
	findByResetToken func(token string) (*models.User, error)
	updateFunc       func(user *models.User) error
}

func (m *mockUserRepository) Create(user *models.User) error {
	if m.createFunc != nil {
		return m.createFunc(user)
	}
	return nil
}

func (m *mockUserRepository) FindByEmail(email string) (*models.User, error) {
	if m.findByEmail != nil {
		return m.findByEmail(email)
	}
	return nil, nil
}

func (m *mockUserRepository) FindByID(id string) (*models.User, error) {
	if m.findByID != nil {
		return m.findByID(id)
	}
	return nil, nil
}

func (m *mockUserRepository) FindByVerificationOTP(otp string) (*models.User, error) {
	if m.findByOTP != nil {
		return m.findByOTP(otp)
	}
	return nil, nil
}

func (m *mockUserRepository) FindByResetToken(token string) (*models.User, error) {
	if m.findByResetToken != nil {
		return m.findByResetToken(token)
	}
	return nil, nil
}

func (m *mockUserRepository) Update(user *models.User) error {
	if m.updateFunc != nil {
		return m.updateFunc(user)
	}
	return nil
}

type mockEmailService struct {
	sendVerificationOTPFunc func(to, otp string) error
	sendPasswordResetFunc   func(to, token string) error
}

func (m *mockEmailService) SendVerificationOTP(to, otp string) error {
	if m.sendVerificationOTPFunc != nil {
		return m.sendVerificationOTPFunc(to, otp)
	}
	return nil
}

func (m *mockEmailService) SendPasswordResetEmail(to, token string) error {
	if m.sendPasswordResetFunc != nil {
		return m.sendPasswordResetFunc(to, token)
	}
	return nil
}

func TestUserUsecase_Register(t *testing.T) {
	repo := &mockUserRepository{}
	emailSvc := &mockEmailService{}
	usecase := NewUserUsecase(repo, emailSvc)

	t.Run("Success", func(t *testing.T) {
		repo.createFunc = func(user *models.User) error {
			if user.Email != "test@example.com" {
				t.Errorf("expected email test@example.com, got %s", user.Email)
			}
			return nil
		}
		emailSvc.sendVerificationOTPFunc = func(to, otp string) error {
			if to != "test@example.com" {
				t.Errorf("expected to test@example.com, got %s", to)
			}
			return nil
		}

		err := usecase.Register("test@example.com", "password123")
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Create Error", func(t *testing.T) {
		repo.createFunc = func(user *models.User) error {
			return errors.New("db error")
		}
		err := usecase.Register("test@example.com", "password123")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestUserUsecase_Login(t *testing.T) {
	repo := &mockUserRepository{}
	emailSvc := &mockEmailService{}
	usecase := NewUserUsecase(repo, emailSvc)

	password := "password123"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	userID := primitive.NewObjectID()

	t.Run("Success", func(t *testing.T) {
		repo.findByEmail = func(email string) (*models.User, error) {
			return &models.User{
				ID:         userID,
				Email:      email,
				Password:   string(hashedPassword),
				IsVerified: true,
				Role:       "user",
			}, nil
		}

		token, err := usecase.Login("test@example.com", password)
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if token == "" {
			t.Error("expected token, got empty string")
		}
	})

	t.Run("Invalid Password", func(t *testing.T) {
		repo.findByEmail = func(email string) (*models.User, error) {
			return &models.User{
				Password:   string(hashedPassword),
				IsVerified: true,
			}, nil
		}

		_, err := usecase.Login("test@example.com", "wrongpassword")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})

	t.Run("Unverified Email", func(t *testing.T) {
		repo.findByEmail = func(email string) (*models.User, error) {
			return &models.User{
				Password:   string(hashedPassword),
				IsVerified: false,
			}, nil
		}

		_, err := usecase.Login("test@example.com", password)
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestUserUsecase_VerifyOTP(t *testing.T) {
	repo := &mockUserRepository{}
	emailSvc := &mockEmailService{}
	usecase := NewUserUsecase(repo, emailSvc)

	t.Run("Success", func(t *testing.T) {
		repo.findByOTP = func(otp string) (*models.User, error) {
			return &models.User{
				Email:     "test@example.com",
				OTPExpiry: time.Now().Add(10 * time.Minute),
			}, nil
		}
		repo.updateFunc = func(user *models.User) error {
			if !user.IsVerified {
				t.Error("expected user to be verified")
			}
			return nil
		}

		err := usecase.VerifyOTP("test@example.com", "123456")
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Expired OTP", func(t *testing.T) {
		repo.findByOTP = func(otp string) (*models.User, error) {
			return &models.User{
				Email:     "test@example.com",
				OTPExpiry: time.Now().Add(-10 * time.Minute),
			}, nil
		}

		err := usecase.VerifyOTP("test@example.com", "123456")
		if err == nil || err.Error() != "OTP expired" {
			t.Errorf("expected 'OTP expired' error, got %v", err)
		}
	})

	t.Run("Invalid Email", func(t *testing.T) {
		repo.findByOTP = func(otp string) (*models.User, error) {
			return &models.User{
				Email: "other@example.com",
			}, nil
		}

		err := usecase.VerifyOTP("test@example.com", "123456")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestUserUsecase_RequestPasswordReset(t *testing.T) {
	repo := &mockUserRepository{}
	emailSvc := &mockEmailService{}
	usecase := NewUserUsecase(repo, emailSvc)

	t.Run("Success", func(t *testing.T) {
		repo.findByEmail = func(email string) (*models.User, error) {
			return &models.User{Email: email}, nil
		}
		repo.updateFunc = func(user *models.User) error {
			if user.ResetToken == "" {
				t.Error("expected reset token to be set")
			}
			return nil
		}
		emailSvc.sendPasswordResetFunc = func(to, token string) error {
			return nil
		}

		err := usecase.RequestPasswordReset("test@example.com")
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("User Not Found", func(t *testing.T) {
		repo.findByEmail = func(email string) (*models.User, error) {
			return nil, nil
		}

		err := usecase.RequestPasswordReset("test@example.com")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestUserUsecase_ResetPassword(t *testing.T) {
	repo := &mockUserRepository{}
	emailSvc := &mockEmailService{}
	usecase := NewUserUsecase(repo, emailSvc)

	t.Run("Success", func(t *testing.T) {
		repo.findByResetToken = func(token string) (*models.User, error) {
			return &models.User{ResetToken: token}, nil
		}
		repo.updateFunc = func(user *models.User) error {
			if user.ResetToken != "" {
				t.Error("expected reset token to be cleared")
			}
			return nil
		}

		err := usecase.ResetPassword("valid-token", "newpassword123")
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		repo.findByResetToken = func(token string) (*models.User, error) {
			return nil, errors.New("not found")
		}

		err := usecase.ResetPassword("invalid-token", "newpassword123")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}
