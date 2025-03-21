package middleware

import (
	"inventory-service/infrastructure/config"
	"net/http"
)

func ServiceAuthMiddleware(cfg *config.Config) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Parse the API key from the request header
			apiKey := r.Header.Get("X-API-Key")
			if apiKey == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"error": "API key missing"}`))
				return
			}

			// Validate the API key against the configured value
			if apiKey != cfg.ServiceAPIKey {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte(`{"error": "Invalid API key"}`))
				return
			}

			// API key is valid, proceed to the next handler
			next.ServeHTTP(w, r)
		})
	}
}
