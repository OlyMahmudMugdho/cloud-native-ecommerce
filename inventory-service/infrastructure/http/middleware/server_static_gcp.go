package middleware

import (
	"io"
	"log"
	"net/http"
	"strings"
)

// serveFromGCS returns an http.HandlerFunc that proxies files from GCS
func ServeFromGCS(bucketName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Trim the prefix `/inventory/`
		path := strings.TrimPrefix(r.URL.Path, "/inventory/")
		if path == "" || path == "/" {
			path = "index.html"
		}
		gcsURL := "https://storage.googleapis.com/" + bucketName + "/" + path

		resp, err := http.Get(gcsURL)
		if err != nil || resp.StatusCode != http.StatusOK {
			// fallback to index.html
			log.Printf("Falling back to index.html for path: %s", path)
			indexResp, err := http.Get("https://storage.googleapis.com/" + bucketName + "/index.html")
			if err != nil || indexResp.StatusCode != http.StatusOK {
				http.Error(w, "404 Not Found", http.StatusNotFound)
				return
			}
			defer indexResp.Body.Close()
			for k, vv := range indexResp.Header {
				for _, v := range vv {
					w.Header().Add(k, v)
				}
			}
			w.WriteHeader(indexResp.StatusCode)
			io.Copy(w, indexResp.Body)
			return
		}
		defer resp.Body.Close()
		for k, vv := range resp.Header {
			for _, v := range vv {
				w.Header().Add(k, v)
			}
		}
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	}
}
