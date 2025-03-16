#!/bin/bash

# Create subdirectories and files
mkdir -p inventory-service/cmd
touch inventory-service/cmd/main.go

mkdir -p inventory-service/domain/models
touch inventory-service/domain/models/product.go
touch inventory-service/domain/models/user.go

touch inventory-service/domain/product_repository.go
touch inventory-service/domain/user_repository.go

mkdir -p inventory-service/application
touch inventory-service/application/product_usecase.go
touch inventory-service/application/user_usecase.go

mkdir -p inventory-service/infrastructure/config
touch inventory-service/infrastructure/config/config.go

mkdir -p inventory-service/infrastructure/db
touch inventory-service/infrastructure/db/mongo.go

mkdir -p inventory-service/infrastructure/http/handlers
touch inventory-service/infrastructure/http/handlers/product_handler.go
touch inventory-service/infrastructure/http/handlers/user_handler.go

mkdir -p inventory-service/infrastructure/http/middleware
touch inventory-service/infrastructure/http/middleware/auth.go

mkdir -p inventory-service/infrastructure/http/routes
touch inventory-service/infrastructure/http/routes/routes.go

mkdir -p inventory-service/infrastructure/repository
touch inventory-service/infrastructure/repository/product_repository_impl.go
touch inventory-service/infrastructure/repository/user_repository_impl.go

mkdir -p inventory-service/infrastructure/services
touch inventory-service/infrastructure/services/cloudinary.go
touch inventory-service/infrastructure/services/email.go

mkdir -p inventory-service/infrastructure/dto
touch inventory-service/infrastructure/dto/product_dto.go
touch inventory-service/infrastructure/dto/user_dto.go

mkdir -p inventory-service/utils
touch inventory-service/utils/jwt.go

touch inventory-service/config.yaml
touch inventory-service/Makefile

echo "Directory layout created successfully!"
