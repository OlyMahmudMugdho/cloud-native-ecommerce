resource "google_compute_subnetwork" "kubernetes_workloads_subnet" {
  name          = var.kubernetes_workloads_subnet_name
  ip_cidr_range = "10.1.0.0/16"
  region        = var.region
  network       = google_compute_network.workloads_network.id
}

resource "google_compute_subnetwork" "server_workloads_subnet" {
  name          = var.server_workloads_subnet_name
  ip_cidr_range = "10.2.0.0/16"
  region        = var.region
  network       = google_compute_network.workloads_network.id
}

