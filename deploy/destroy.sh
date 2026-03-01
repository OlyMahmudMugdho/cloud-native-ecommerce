#!/bin/bash


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/common.sh"

confirm_destruction() {
    local resource="$1"
    
    if [[ "${FORCE:-0}" == "1" ]]; then
        return 0
    fi
    
    echo -e "${RED}⚠️  WARNING: You are about to destroy $resource${NC}"
    echo -e "${YELLOW}This action cannot be undone!${NC}"
    read -p "Type 'yes' to confirm: " confirmation
    
    if [[ "$confirmation" != "yes" ]]; then
        log_info "Destruction cancelled"
        return 1
    fi
    return 0
}

destroy_monitoring() {
    log_step "Destroying Monitoring Stack"
    
    confirm_destruction "monitoring stack" || return 0
    
    log_info "Uninstalling Prometheus stack"
    helm uninstall prometheus-stack -n monitoring 2>/dev/null || log_warn "Prometheus stack not found"
    
    log_info "Uninstalling Zipkin"
    helm uninstall zipkin -n cloud-native-ecommerce 2>/dev/null || log_warn "Zipkin not found"
    
    log_info "Deleting monitoring namespace"
    kubectl delete namespace monitoring 2>/dev/null || log_warn "Monitoring namespace not found"
    
    log_success "Monitoring stack destroyed"
}

destroy_kubernetes() {
    log_step "Destroying Kubernetes Workloads"
    
    confirm_destruction "Kubernetes workloads" || return 0
    
    cd "$PROJECT_ROOT/k8s"
    
    log_info "Deleting Kubernetes resources"
    kubectl delete -f ingress.yaml 2>/dev/null || log_warn "Ingress not found"
    kubectl delete -f ecommerce-ui/ 2>/dev/null || log_warn "E-commerce UI not found"
    kubectl delete -f gateway/ 2>/dev/null || log_warn "Gateway not found"
    kubectl delete -f order/ 2>/dev/null || log_warn "Order service not found"
    kubectl delete -f inventory/ 2>/dev/null || log_warn "Inventory service not found"
    kubectl delete -f product/ 2>/dev/null || log_warn "Product service not found"
    kubectl delete -f configmap.yaml 2>/dev/null || log_warn "ConfigMap not found"
    kubectl delete -f secret.yaml 2>/dev/null || log_warn "Secret not found"
    
    log_info "Deleting ArgoCD"
    kubectl delete -f argocd/ 2>/dev/null || log_warn "ArgoCD application not found"
    kubectl delete namespace argocd 2>/dev/null || log_warn "ArgoCD namespace not found"
    
    log_info "Uninstalling ingress-nginx"
    helm uninstall ingress-nginx -n ingress-nginx 2>/dev/null || log_warn "Ingress-nginx not found"
    kubectl delete namespace ingress-nginx 2>/dev/null || log_warn "Ingress-nginx namespace not found"
    
    log_info "Deleting application namespace"
    kubectl delete namespace cloud-native-ecommerce 2>/dev/null || log_warn "Application namespace not found"
    
    cd "$PROJECT_ROOT"
    
    log_success "Kubernetes workloads destroyed"
}

destroy_infrastructure() {
    log_step "Destroying Infrastructure"
    
    confirm_destruction "GCP infrastructure (VMs, GKE, Cloud SQL, VPC)" || return 0
    
    cd "$PROJECT_ROOT/infrastructure"
    
    export GOOGLE_CLOUD_KEYFILE_JSON="$PWD/account.json"
    export GOOGLE_APPLICATION_CREDENTIALS="$PWD/account.json"
    
    log_info "Destroying Terraform infrastructure (this may take 10-15 minutes)"
    if execute "terraform destroy -auto-approve" "Infrastructure destroyed"; then
        :
    else
        log_error "Terraform destroy failed"
    fi
    
    cd "$PROJECT_ROOT"
    
    log_success "Infrastructure destroyed"
}

destroy_all() {
    log_step "Destroying Complete Deployment"
    
    confirm_destruction "EVERYTHING (monitoring, Kubernetes, infrastructure)" || return 0
    
    destroy_monitoring
    destroy_kubernetes
    destroy_infrastructure
    
    log_success "Complete deployment destroyed"
}

show_usage() {
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  monitoring       Destroy monitoring stack only"
    echo "  kubernetes       Destroy Kubernetes workloads only"
    echo "  infrastructure   Destroy GCP infrastructure only"
    echo "  all              Destroy everything (default)"
    echo ""
    echo "Environment variables:"
    echo "  FORCE=1          Skip confirmation prompts"
    echo ""
}

main() {
    local target="${1:-all}"
    
    case "$target" in
        monitoring)
            destroy_monitoring
            ;;
        kubernetes)
            destroy_kubernetes
            ;;
        infrastructure)
            destroy_infrastructure
            ;;
        all)
            destroy_all
            ;;
        help|--help|-h)
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown target: $target"
            show_usage
            exit 1
            ;;
    esac
    
    print_summary
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        exit 1
    fi
}

main "$@"
