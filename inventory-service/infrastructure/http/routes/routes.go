package routes

import (
	"inventory-service/application"
	"inventory-service/infrastructure/config"
	"inventory-service/infrastructure/db"
	"inventory-service/infrastructure/http/handlers"
	"inventory-service/infrastructure/http/middleware"
	"inventory-service/infrastructure/repository"
	"inventory-service/infrastructure/services"

	"github.com/gorilla/mux"
)

func SetupRouter(mongoClient *db.MongoClient, cfg *config.Config) *mux.Router {
	r := mux.NewRouter()

	// Initialize repositories
	productRepo := repository.NewProductRepository(mongoClient, "inventory_db", "products")
	userRepo := repository.NewUserRepository(mongoClient, "inventory_db", "users")

	// Initialize services
	cloudinarySvc := services.NewCloudinaryService(cfg.CloudinaryCloudName, cfg.CloudinaryAPIKey, cfg.CloudinaryAPISecret)
	emailSvc := services.NewEmailService(cfg)

	// Initialize use cases
	productUsecase := application.NewProductUsecase(productRepo)
	userUsecase := application.NewUserUsecase(userRepo, emailSvc)

	// Initialize handlers
	productHandler := handlers.NewProductHandler(productUsecase, cloudinarySvc)
	userHandler := handlers.NewUserHandler(userUsecase)

	// Public routes
	r.HandleFunc("/users/register", userHandler.Register).Methods("POST")
	r.HandleFunc("/users/login", userHandler.Login).Methods("POST")
	r.HandleFunc("/users/verify/{token}", userHandler.VerifyEmail).Methods("GET")
	r.HandleFunc("/users/password/reset", userHandler.RequestPasswordReset).Methods("POST")
	r.HandleFunc("/users/password/reset/{token}", userHandler.ResetPassword).Methods("POST")

	// Protected routes
	authRouter := r.PathPrefix("/").Subrouter()
	authRouter.Use(middleware.AuthMiddleware)

	authRouter.HandleFunc("/products", productHandler.GetAllProducts).Methods("GET")
	authRouter.HandleFunc("/products/{id}", productHandler.GetProduct).Methods("GET")

	// Admin-only routes
	adminRouter := authRouter.PathPrefix("/").Subrouter()
	adminRouter.Use(middleware.AdminOnly)

	adminRouter.HandleFunc("/products", productHandler.CreateProduct).Methods("POST")
	adminRouter.HandleFunc("/products/{id}", productHandler.UpdateProduct).Methods("PUT")
	adminRouter.HandleFunc("/products/{id}", productHandler.DeleteProduct).Methods("DELETE")

	return r
}
