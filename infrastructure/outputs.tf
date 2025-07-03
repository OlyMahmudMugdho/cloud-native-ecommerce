output "sql_instance_external_ip" {
  value = google_sql_database_instance.postgres_instance.public_ip_address
}