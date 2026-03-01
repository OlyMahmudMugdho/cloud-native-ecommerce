#!/bin/bash


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/prerequisites.sh"

main() {
    log_step "04 - Monitoring Stack Deployment"
    
    # Check prerequisites
    check_prerequisites || exit 1
    
    # Create monitoring namespace
    log_info "Creating monitoring namespace"
    kubectl create namespace monitoring 2>/dev/null || log_warn "Monitoring namespace may already exist"
    
    # Deploy Prometheus & Grafana
    log_info "Adding prometheus-community Helm repository"
    execute "helm repo add prometheus-community https://prometheus-community.github.io/helm-charts" "Helm repo added" || log_warn "Repo may already exist"
    execute "helm repo update" "Helm repos updated"
    
    log_info "Installing Prometheus stack (this may take 5-7 minutes)"
    if helm status prometheus-stack -n monitoring &>/dev/null; then
        log_warn "Prometheus stack already installed, skipping"
    else
        execute "helm install prometheus-stack prometheus-community/kube-prometheus-stack --namespace monitoring" "Prometheus stack installed"
    fi
    
    log_info "Patching Grafana service to LoadBalancer"
    kubectl patch svc prometheus-stack-grafana -n monitoring -p '{"spec": {"type": "LoadBalancer"}}' 2>/dev/null || log_warn "Grafana service patch may have failed"
    
    # Deploy Zipkin
    log_info "Adding openzipkin Helm repository"
    execute "helm repo add openzipkin https://openzipkin.github.io/zipkin" "Helm repo added" || log_warn "Repo may already exist"
    execute "helm repo update" "Helm repos updated"
    
    log_info "Installing Zipkin"
    if helm status zipkin -n cloud-native-ecommerce &>/dev/null; then
        log_warn "Zipkin already installed, skipping"
    else
        execute "helm install zipkin openzipkin/zipkin --namespace cloud-native-ecommerce" "Zipkin installed"
    fi
    
    log_info "Patching Zipkin service to LoadBalancer"
    kubectl patch svc zipkin -n cloud-native-ecommerce -p '{"spec": {"type": "LoadBalancer"}}' 2>/dev/null || log_warn "Zipkin service patch may have failed"
    
    # Check pod status without blocking
    log_info "Checking monitoring pod status (non-blocking)"
    kubectl get pods -n monitoring 2>/dev/null || log_warn "Monitoring pods not yet created"
    kubectl get pods -n cloud-native-ecommerce -l app.kubernetes.io/name=zipkin 2>/dev/null || log_warn "Zipkin pods not yet created"
    
    log_success "Monitoring stack deployed"
    
    print_summary
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        exit 1
    fi
}

main "$@"
