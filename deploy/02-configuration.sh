#!/bin/bash


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/prerequisites.sh"

main() {
    log_step "02 - Configuration Management (Ansible)"
    
    # Check prerequisites
    check_prerequisites || exit 1
    check_file_exists "$PROJECT_ROOT/infrastructure/output.json" "Terraform output" || exit 1
    
    cd "$PROJECT_ROOT/ansible"
    
    # Make scripts executable
    execute "chmod +x scripts/*" "Scripts made executable" || log_warn "Failed to chmod scripts"
    
    # Extract GCP project and zone
    log_info "Extracting GCP configuration"
    GCP_PROJECT=$(grep 'project' ../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"')
    GCP_ZONE=$(grep 'zone' ../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"')
    
    log_info "GCP Project: $GCP_PROJECT"
    log_info "GCP Zone: $GCP_ZONE"
    
    # GCP Login
    log_info "Authenticating with GCP"
    if execute "ansible-playbook -i inventory/inventory.ini playbooks/gcp_login.yaml" "GCP authentication completed"; then
        :
    else
        log_warn "GCP login had issues"
    fi
    
    # Setup Redis & Kafka
    log_info "Setting up Redis and Kafka"
    if execute "ansible-playbook -i inventory/inventory.ini playbooks/setup-redis-kafka.yaml" "Redis & Kafka setup completed"; then
        :
    else
        log_warn "Redis & Kafka setup had issues"
    fi
    
    # Setup MongoDB
    log_info "Setting up MongoDB"
    if execute "ansible-playbook -i inventory/inventory.ini playbooks/setup-mongodb.yaml" "MongoDB setup completed"; then
        :
    else
        log_warn "MongoDB setup had issues"
    fi
    
    # Deploy MongoDB
    log_info "Deploying MongoDB configuration"
    gcloud auth login --cred-file=account.json --quiet 2>/dev/null || log_warn "GCloud auth failed"
    
    if execute "ansible-playbook -i inventory/inventory.ini playbooks/deploy-mongodb.yaml" "MongoDB deployed"; then
        :
    else
        log_warn "MongoDB deployment had issues"
    fi
    
    # Fetch Kubernetes credentials
    log_info "Fetching Kubernetes credentials"
    if execute "ansible-playbook -i inventory/inventory.ini playbooks/fetch-k8s-credentials.yaml" "Kubernetes credentials fetched"; then
        :
    else
        log_error "Failed to fetch Kubernetes credentials"
    fi
    
    # Update ConfigMap with infrastructure IPs
    log_step "Updating Kubernetes ConfigMap"
    
    SQL_IP=$(jq -r '.sql_instance_external_ip.value' ../infrastructure/output.json)
    MONGO_IP=$(jq -r '.mongodb_vm_external_ip.value' ../infrastructure/output.json)
    REDIS_IP=$(jq -r '.redis_kafka_vm_ip.value' ../infrastructure/output.json)
    
    log_info "SQL Instance IP: $SQL_IP"
    log_info "MongoDB IP: $MONGO_IP"
    log_info "Redis/Kafka IP: $REDIS_IP"
    
    cd "$PROJECT_ROOT/k8s"
    
    yq -y ".data.CART_DB_URI = \"jdbc:postgresql://$SQL_IP:5432/cart_db\"" configmap.yaml | sponge configmap.yaml
    yq -y ".data.ORDER_DB_URI = \"jdbc:postgresql://$SQL_IP:5432/order_db\"" configmap.yaml | sponge configmap.yaml
    yq -y ".data.MONGO_URL = \"mongodb://$MONGO_IP:27017\"" configmap.yaml | sponge configmap.yaml
    yq -y ".data.REDIS_URL = \"redis://$REDIS_IP:6379\"" configmap.yaml | sponge configmap.yaml
    yq -y ".data.KAFKA_BROKER = \"$REDIS_IP:9092\"" configmap.yaml | sponge configmap.yaml
    yq -y ".data.REDIS_HOST = \"$REDIS_IP\"" configmap.yaml | sponge configmap.yaml
    
    log_success "ConfigMap updated with infrastructure IPs"
    
    cd "$PROJECT_ROOT"
    
    print_summary
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        exit 1
    fi
}

main "$@"
