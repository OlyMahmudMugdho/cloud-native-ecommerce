resource "google_sql_database_instance" "postgres_instance" {
  name             = "database-instance"
  region           = var.region
  database_version = "POSTGRES_17"

  
  settings {
    tier      = "db-custom-4-16384"
    edition   = "ENTERPRISE"
    disk_size = 100
    disk_type = "PD_SSD"
    deletion_protection_enabled = false
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "public-internet"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false
}
