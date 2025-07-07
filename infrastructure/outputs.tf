output "sql_instance_external_ip" {
  value = google_sql_database_instance.postgres_instance.public_ip_address
}

output "redis_kafka_vm_ip" {
  value = google_compute_instance.redis_kafka_vm.network_interface[0].access_config[0].nat_ip
}

output "mongodb_keycloak_vm_ip" {
  value = google_compute_instance.mongodb_keycloak_vm.network_interface[0].network_ip
}

output "mongodb_keycloak_vm_external_ip" {
   value = google_compute_instance.mongodb_keycloak_vm.network_interface[0].access_config[0].nat_ip
}