package utils

import (
	"testing"
)

func TestJWT(t *testing.T) {
	userID := "user123"
	role := "admin"

	t.Run("Generate and Validate", func(t *testing.T) {
		token, err := GenerateJWT(userID, role)
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if token == "" {
			t.Error("expected token, got empty string")
		}

		claims, err := ValidateJWT(token)
		if err != nil {
			t.Errorf("expected nil error, got %v", err)
		}
		if claims.UserID != userID {
			t.Errorf("expected %s, got %s", userID, claims.UserID)
		}
		if claims.Role != role {
			t.Errorf("expected %s, got %s", role, claims.Role)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		_, err := ValidateJWT("invalid.token.here")
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}
