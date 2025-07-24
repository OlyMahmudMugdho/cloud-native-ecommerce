resource "google_sql_database" "order_db" {
  name            = var.order_db_name
  instance        = google_sql_database_instance.postgres_instance.name
  deletion_policy = "DELETE"
  depends_on      = [google_sql_database_instance.postgres_instance]
}

resource "google_sql_database" "cart_db" {
  name            = var.carts_db_name
  instance        = google_sql_database_instance.postgres_instance.name
  deletion_policy = "DELETE"
  depends_on      = [google_sql_database_instance.postgres_instance]
}