resource "google_container_cluster" "workload_cluster" {
  name               = "workload-cluster"
  initial_node_count = 3
  network            = google_compute_network.workloads_network.id
  subnetwork         = google_compute_subnetwork.kubernetes_workloads_subnet.id
  location           = var.zone

  deletion_protection = false

  release_channel {
    channel = "RAPID"
  }

  gateway_api_config {
    channel = "CHANNEL_STANDARD"
  }

  node_config {
    machine_type = var.gke_node_machine_type
    disk_type = "pd-balanced"
    disk_size_gb = 70
  }
}
