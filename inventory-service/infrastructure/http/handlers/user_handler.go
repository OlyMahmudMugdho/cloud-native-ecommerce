package handlers

import (
	"encoding/json"
	"inventory-service/application"
	"inventory-service/infrastructure/dto"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	usecase   *application.UserUsecase
	validator *validator.Validate
}

func NewUserHandler(usecase *application.UserUsecase) *UserHandler {
	return &UserHandler{
		usecase:   usecase,
		validator: validator.New(),
	}
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var registerDTO dto.RegisterUserDTO
	if err := json.NewDecoder(r.Body).Decode(&registerDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(registerDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.usecase.Register(registerDTO.Email, registerDTO.Password)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	w.Write([]byte("Registration successful, please check your email for the OTP"))
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var loginDTO dto.LoginUserDTO
	if err := json.NewDecoder(r.Body).Decode(&loginDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(loginDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	token, err := h.usecase.Login(loginDTO.Email, loginDTO.Password)
	if err != nil {
		http.Error(w, "Invalid credentials or unverified email", http.StatusUnauthorized)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}

func (h *UserHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var verifyOTPDTO dto.VerifyOTPDTO
	if err := json.NewDecoder(r.Body).Decode(&verifyOTPDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(verifyOTPDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.usecase.VerifyOTP(verifyOTPDTO.Email, verifyOTPDTO.OTP)
	if err != nil {
		http.Error(w, "Invalid or expired OTP", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Email verified successfully"))
}

func (h *UserHandler) RequestPasswordReset(w http.ResponseWriter, r *http.Request) {
	var requestDTO dto.RequestPasswordResetDTO
	if err := json.NewDecoder(r.Body).Decode(&requestDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(requestDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.usecase.RequestPasswordReset(requestDTO.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset email sent"))
}

func (h *UserHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var resetDTO dto.ResetPasswordDTO
	if err := json.NewDecoder(r.Body).Decode(&resetDTO); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.validator.Struct(resetDTO); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	err := h.usecase.ResetPassword(resetDTO.Token, resetDTO.NewPassword)
	if err != nil {
		http.Error(w, "Invalid or expired token", http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Password reset successfully"))
}
