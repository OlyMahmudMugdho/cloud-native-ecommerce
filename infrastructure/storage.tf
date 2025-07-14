
/* # GCS bucket
resource "google_storage_bucket" "inventory_frontend" {
  name                        = "olymahmudmugdho-cne-inventory-service-jul-14-2025-001"
  location                    = "US"
  force_destroy               = true
  uniform_bucket_level_access = true
  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
}

# Make the bucket objects public
resource "google_storage_bucket_iam_binding" "public_read" {
  bucket = google_storage_bucket.inventory_frontend.name
  role   = "roles/storage.objectViewer"

  members = [
    "allUsers",
  ]
} */
