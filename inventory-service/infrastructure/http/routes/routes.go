package routes

import (
	"inventory-service/application"
	"inventory-service/infrastructure/config"
	"inventory-service/infrastructure/db"
	"inventory-service/infrastructure/http/handlers"
	"inventory-service/infrastructure/http/middleware"
	"inventory-service/infrastructure/repository"
	"inventory-service/infrastructure/services"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
)

func SetupRouter(mongoClient *db.MongoClient, cfg *config.Config) *mux.Router {
	r := mux.NewRouter()

	// API subrouter with /inventory/api prefix
	apiRouter := r.PathPrefix("/inventory/api").Subrouter()
	log.Println("API router initialized with prefix /inventory/api")

	// Initialize repositories
	productRepo := repository.NewProductRepository(mongoClient, "inventory_db", "products")
	userRepo := repository.NewUserRepository(mongoClient, "inventory_db", "users")
	categoryRepo := repository.NewCategoryRepository(mongoClient, "inventory_db", "categories")
	userInfoRepo := repository.NewUserInfoRepository(mongoClient, "inventory_db", "users")
	stockRepo := repository.NewStockRepository(mongoClient, "inventory_db", "products")

	// Initialize services
	cloudinarySvc := services.NewCloudinaryService(cfg.CloudinaryCloudName, cfg.CloudinaryAPIKey, cfg.CloudinaryAPISecret)
	emailSvc := services.NewEmailService(cfg)

	// Initialize use cases
	productUsecase := application.NewProductUsecase(productRepo)
	userUsecase := application.NewUserUsecase(userRepo, emailSvc)
	categoryUsecase := application.NewCategoryUsecase(categoryRepo)
	userInfoUsecase := application.NewUserInfoUsecase(userInfoRepo)
	stockUsecase := application.NewStockUsecase(stockRepo)

	// Initialize handlers
	productHandler := handlers.NewProductHandler(productUsecase, cloudinarySvc)
	userHandler := handlers.NewUserHandler(userUsecase)
	categoryHandler := handlers.NewCategoryHandler(categoryUsecase)
	userInfoHandler := handlers.NewUserInfoHandler(userInfoUsecase)
	stockHandler := handlers.NewStockHandler(stockUsecase)

	// Public routes under /inventory/api
	apiRouter.HandleFunc("/users/register", userHandler.Register).Methods("POST")
	apiRouter.HandleFunc("/users/login", userHandler.Login).Methods("POST")
	log.Println("Registering route: /inventory/api/users/verify/{token}")
	apiRouter.HandleFunc("/users/verify/{token}", userHandler.VerifyEmail).Methods("GET")
	apiRouter.HandleFunc("/users/password/reset", userHandler.RequestPasswordReset).Methods("POST")
	apiRouter.HandleFunc("/users/password/reset/{token}", userHandler.ResetPassword).Methods("POST")

	// Public GET routes for products and categories
	apiRouter.HandleFunc("/products", productHandler.GetAllProducts).Methods("GET")
	apiRouter.HandleFunc("/products/{id}", productHandler.GetProduct).Methods("GET")
	apiRouter.HandleFunc("/categories", categoryHandler.GetAllCategories).Methods("GET")
	apiRouter.HandleFunc("/categories/{id}", categoryHandler.GetCategory).Methods("GET")

	// Protected routes under /inventory/api (authentication required)
	authRouter := apiRouter.PathPrefix("/").Subrouter()
	authRouter.Use(middleware.AuthMiddleware)

	// Routes accessible to all authenticated users
	authRouter.HandleFunc("/products", productHandler.CreateProduct).Methods("POST")
	authRouter.HandleFunc("/categories", categoryHandler.CreateCategory).Methods("POST")

	// Admin-only routes under /inventory/api (authentication + admin role required)
	adminRouter := authRouter.PathPrefix("/").Subrouter()
	adminRouter.Use(middleware.AdminOnly)

	adminRouter.HandleFunc("/products/{id}", productHandler.UpdateProduct).Methods("PUT")
	adminRouter.HandleFunc("/products/{id}", productHandler.DeleteProduct).Methods("DELETE")
	adminRouter.HandleFunc("/categories/{id}", categoryHandler.UpdateCategory).Methods("PUT")
	adminRouter.HandleFunc("/categories/{id}", categoryHandler.DeleteCategory).Methods("DELETE")

	// Admin-only user info routes
	adminRouter.HandleFunc("/users", userInfoHandler.GetAll).Methods("GET")
	adminRouter.HandleFunc("/users/{id}", userInfoHandler.GetByID).Methods("GET")
	adminRouter.HandleFunc("/users/{id}", userInfoHandler.Update).Methods("PUT")
	adminRouter.HandleFunc("/users/{id}", userInfoHandler.Delete).Methods("DELETE")

	// Service-only routes under /inventory/api (API key required)
	serviceRouter := apiRouter.PathPrefix("/").Subrouter()
	serviceRouter.Use(middleware.ServiceAuthMiddleware(cfg))
	serviceRouter.HandleFunc("/stocks/bulk-update", stockHandler.BulkUpdateStock).Methods("POST")

	// Serve static React build files from cmd/dist with SPA fallback
	fs := http.FileServer(http.Dir("cmd/dist"))
	r.PathPrefix("/").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join("cmd/dist", r.URL.Path)
		if _, err := os.Stat(path); os.IsNotExist(err) {
			http.ServeFile(w, r, "cmd/dist/index.html")
		} else {
			fs.ServeHTTP(w, r)
		}
	})).Methods("GET")

	return r
}
