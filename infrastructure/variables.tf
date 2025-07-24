variable "project" {
  type = string
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "zone" {
  type    = string
  default = "us-central1-c"
}

variable "vpc_name" {
  type    = string
  default = "workloads-network"
}

variable "kubernetes_workloads_subnet_name" {
  type    = string
  default = "kubernetes-workloads"
}

variable "server_workloads_subnet_name" {
  type    = string
  default = "server-workloads"
}

variable "auto_create_subnetworks_value" {
  type    = bool
  default = false
}

variable "redis_kafka_rule_name" {
  type    = string
  default = "redis-kafka-rule"
}

variable "redis_kafka_tags" {
  type    = set(string)
  default = ["redis-kafka"]
}

variable "redis_kafka_rule_ranges" {
  type    = set(string)
  default = ["0.0.0.0/0"]
}

variable "redis_kafka_vm_name" {
  type    = string
  default = "redis-kafka-server"
}


variable "gke_node_machine_type" {
  type    = string
  default = "e2-standard-4"
}

variable "redis_kafka_machine_type" {
  type    = string
  default = "e2-standard-4"
}

variable "mongodb_machine_type" {
  type    = string
  default = "e2-standard-4"
}


variable "mongodb_vm_name" {
  type    = string
  default = "mongodb-server"
}

variable "mongodb_tags" {
  type    = set(string)
  default = ["mongodb"]
}

variable "mongodb_rule_ssh_source" {
  type    = set(string)
  default = ["0.0.0.0/0"]
}


variable "mongodb_rule_name" {
  type    = string
  default = "mongodb-rule"
}


variable "order_db_name" {
  type    = string
  default = "order_db"
}

variable "carts_db_name" {
  type    = string
  default = "cart_db"
}

variable "auth_db_name" {
  type    = string
  default = "keycloak"
}

variable "postgres_username" {
  type = string
}

variable "postgres_password" {
  type = string
}

variable "workload_network_router_name" {
  type = string
  default = "workload-network-router"
}

variable "workload_nat_name" {
  type = string
  default = "workload-nat"
}