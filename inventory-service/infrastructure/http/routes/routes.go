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

	// API subrouter with /api/ prefix (register FIRST)
	apiRouter := r.PathPrefix("/api").Subrouter()
	log.Println("API router initialized with prefix /api")

	// Initialize repositories
	productRepo := repository.NewProductRepository(mongoClient, "inventory_db", "products")
	userRepo := repository.NewUserRepository(mongoClient, "inventory_db", "users")
	categoryRepo := repository.NewCategoryRepository(mongoClient, "inventory_db", "categories")

	// Initialize services
	cloudinarySvc := services.NewCloudinaryService(cfg.CloudinaryCloudName, cfg.CloudinaryAPIKey, cfg.CloudinaryAPISecret)
	emailSvc := services.NewEmailService(cfg)

	// Initialize use cases
	productUsecase := application.NewProductUsecase(productRepo)
	userUsecase := application.NewUserUsecase(userRepo, emailSvc)
	categoryUsecase := application.NewCategoryUsecase(categoryRepo)

	// Initialize handlers
	productHandler := handlers.NewProductHandler(productUsecase, cloudinarySvc)
	userHandler := handlers.NewUserHandler(userUsecase)
	categoryHandler := handlers.NewCategoryHandler(categoryUsecase)

	// Public routes under /api/
	apiRouter.HandleFunc("/users/register", userHandler.Register).Methods("POST")
	apiRouter.HandleFunc("/users/login", userHandler.Login).Methods("POST")
	log.Println("Registering route: /api/users/verify/{token}")
	apiRouter.HandleFunc("/users/verify/{token}", userHandler.VerifyEmail).Methods("GET")
	apiRouter.HandleFunc("/users/password/reset", userHandler.RequestPasswordReset).Methods("POST")
	apiRouter.HandleFunc("/users/password/reset/{token}", userHandler.ResetPassword).Methods("POST")

	// Protected routes under /api/
	authRouter := apiRouter.PathPrefix("/").Subrouter()
	authRouter.Use(middleware.AuthMiddleware)

	authRouter.HandleFunc("/products", productHandler.GetAllProducts).Methods("GET")
	authRouter.HandleFunc("/products/{id}", productHandler.GetProduct).Methods("GET")
	authRouter.HandleFunc("/categories", categoryHandler.GetAllCategories).Methods("GET")
	authRouter.HandleFunc("/categories/{id}", categoryHandler.GetCategory).Methods("GET")

	// Admin-only routes under /api/
	adminRouter := authRouter.PathPrefix("/").Subrouter()
	adminRouter.Use(middleware.AdminOnly)

	adminRouter.HandleFunc("/products", productHandler.CreateProduct).Methods("POST")
	adminRouter.HandleFunc("/products/{id}", productHandler.UpdateProduct).Methods("PUT")
	adminRouter.HandleFunc("/products/{id}", productHandler.DeleteProduct).Methods("DELETE")
	adminRouter.HandleFunc("/categories", categoryHandler.CreateCategory).Methods("POST")
	adminRouter.HandleFunc("/categories/{id}", categoryHandler.UpdateCategory).Methods("PUT")
	adminRouter.HandleFunc("/categories/{id}", categoryHandler.DeleteCategory).Methods("DELETE")

	// Serve static React build files from cmd/dist with SPA fallback
	fs := http.FileServer(http.Dir("cmd/dist"))
	r.PathPrefix("/").Handler(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := filepath.Join("cmd/dist", r.URL.Path)
		if _, err := os.Stat(path); os.IsNotExist(err) {
			// If the file doesn’t exist, serve index.html for SPA routing
			http.ServeFile(w, r, "cmd/dist/index.html")
		} else {
			fs.ServeHTTP(w, r)
		}
	})).Methods("GET")

	return r
}
