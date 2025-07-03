resource "google_sql_user" "postgres_user" {
  name     = var.postgres_username
  instance = google_sql_database_instance.postgres_instance.name
  password = var.postgres_password
}
