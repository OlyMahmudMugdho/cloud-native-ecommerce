resource "google_compute_instance" "redis_kafka_vm" {
  name         = var.redis_kafka_vm_name
  machine_type = var.redis_kafka_machine_type
  zone         = var.zone

  tags = var.redis_kafka_tags

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      type  = "pd-balanced"
      size  = 50
    }
  }

  network_interface {
    network    = google_compute_network.workloads_network.id
    subnetwork = google_compute_subnetwork.server_workloads_subnet.id

    access_config {
      // Ephemeral public IP
    }

  }

}

resource "google_compute_instance" "mongodb_vm" {
  name         = var.mongodb_vm_name
  machine_type = var.mongodb_machine_type
  zone         = var.zone

  tags = var.mongodb_tags

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-12"
      type  = "pd-balanced"
      size  = 50
    }
  }

  network_interface {
    network    = google_compute_network.workloads_network.id
    subnetwork = google_compute_subnetwork.server_workloads_subnet.id

    access_config {
      // Ephemeral public IP
    }
  }

}
