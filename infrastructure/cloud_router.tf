resource "google_compute_router" "workload_network_router" {
  name    = var.workload_network_router_name
  network = google_compute_network.workloads_network.id
  region  = var.region
}
