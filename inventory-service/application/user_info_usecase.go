package application

import (
	"context"
	"inventory-service/domain"
	"inventory-service/domain/models"
	"inventory-service/infrastructure/dto"
)

type UserInfoUsecase struct {
	repo domain.UserInfoRepository
}

func NewUserInfoUsecase(repo domain.UserInfoRepository) *UserInfoUsecase {
	return &UserInfoUsecase{repo: repo}
}

func (uc *UserInfoUsecase) GetByID(ctx context.Context, id string) (*dto.UserDTO, error) {
	user, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	return toUserDTO(user), nil
}

func (uc *UserInfoUsecase) GetAll(ctx context.Context) ([]*dto.UserDTO, error) {
	users, err := uc.repo.GetAll(ctx)
	if err != nil {
		return nil, err
	}
	dtos := make([]*dto.UserDTO, len(users))
	for i, user := range users {
		dtos[i] = toUserDTO(user)
	}
	return dtos, nil
}

func (uc *UserInfoUsecase) Update(ctx context.Context, id string, req *dto.UpdateUserRequest) (*dto.UserDTO, error) {
	user, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Role != "" {
		user.Role = req.Role
	}
	user.IsVerified = req.IsVerified // Always update IsVerified, even if false
	updatedUser, err := uc.repo.Update(ctx, id, user)
	if err != nil {
		return nil, err
	}
	return toUserDTO(updatedUser), nil
}

func (uc *UserInfoUsecase) Delete(ctx context.Context, id string) error {
	return uc.repo.Delete(ctx, id)
}

func toUserDTO(user *models.User) *dto.UserDTO {
	return &dto.UserDTO{
		ID:         user.ID.Hex(),
		Email:      user.Email,
		Role:       user.Role,
		IsVerified: user.IsVerified,
	}
}
