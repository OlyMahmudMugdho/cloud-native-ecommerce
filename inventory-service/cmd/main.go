package main

import (
	"log"
	"net/http"

	"inventory-service/infrastructure/config"
	"inventory-service/infrastructure/db"
	"inventory-service/infrastructure/http/routes"
)

func main() {
	// Load configuration
	cfg, err := config.LoadConfig("config.yaml")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize MongoDB
	mongoClient, err := db.NewMongoClient(cfg.MongoURL)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer mongoClient.Disconnect()

	// Setup router
	router := routes.SetupRouter(mongoClient, cfg)

	// Start server
	log.Printf("Server starting on port %s...", cfg.Port)
	err = http.ListenAndServe(":"+cfg.Port, router)
	if err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
