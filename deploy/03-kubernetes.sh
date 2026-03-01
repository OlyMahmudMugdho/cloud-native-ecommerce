#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/prerequisites.sh"

main() {
    log_step "03 - Kubernetes Workloads Deployment"
    
    # Check prerequisites
    check_prerequisites || exit 1
    
    # Setup Ingress Controller
    log_info "Adding ingress-nginx Helm repository"
    execute "helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx" "Helm repo added" || log_warn "Repo may already exist"
    execute "helm repo update" "Helm repos updated"
    
    export USE_GKE_GCLOUD_AUTH_PLUGIN=True
    
    log_info "Creating ingress-nginx namespace"
    kubectl create namespace ingress-nginx 2>/dev/null || log_warn "Namespace may already exist"
    
    log_info "Installing ingress-nginx (this may take 3-5 minutes)"
    if helm status ingress-nginx -n ingress-nginx &>/dev/null; then
        log_warn "ingress-nginx already installed, skipping"
    else
        execute "helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx" "Ingress controller installed"
    fi
    
    # Deploy Kubernetes resources
    cd "$PROJECT_ROOT/k8s"
    
    log_info "Deploying Kubernetes resources"
    execute "kubectl apply -f namespace.yaml" "Namespace created"
    
    if [[ -f "secret.yaml" ]]; then
        execute "kubectl apply -f secret.yaml" "Secrets created"
    else
        log_warn "secret.yaml not found - skipping (create from secret-demo.yaml if needed)"
    fi
    
    execute "kubectl apply -f configmap.yaml" "ConfigMap created"
    execute "kubectl apply -f product/" "Product service deployed"
    execute "kubectl apply -f inventory/" "Inventory service deployed"
    execute "kubectl apply -f order/" "Order service deployed"
    execute "kubectl apply -f gateway/" "Gateway deployed"
    execute "kubectl apply -f ecommerce-ui/" "E-commerce UI deployed"
    execute "kubectl apply -f ingress.yaml" "Ingress configured"
    
    # Deploy ArgoCD
    log_step "Deploying ArgoCD"
    
    kubectl create namespace argocd 2>/dev/null || log_warn "ArgoCD namespace may already exist"
    
    log_info "Installing ArgoCD (this may take 3-5 minutes)"
    if kubectl get deployment argocd-server -n argocd &>/dev/null; then
        log_warn "ArgoCD already installed, skipping"
    else
        if kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml 2>&1 | tee /tmp/argocd-install.log; then
            log_success "ArgoCD installed"
        else
            if grep -q "argocd-server" /tmp/argocd-install.log; then
                log_warn "ArgoCD installed with warnings (CRD annotation issue - can be ignored)"
            else
                log_error "ArgoCD installation failed"
            fi
        fi
        rm -f /tmp/argocd-install.log
    fi
    
    log_info "Patching ArgoCD server to LoadBalancer"
    kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "LoadBalancer", "ports": [{"name": "http", "port": 80, "protocol": "TCP", "targetPort": 8080}, {"name": "https", "port": 443, "protocol": "TCP", "targetPort": 8080}]}}' 2>/dev/null || log_warn "ArgoCD service patch may have failed"
    
    execute "kubectl apply -f argocd/" "ArgoCD application configured"
    
    # Check pod status without blocking
    log_info "Checking pod readiness (non-blocking)"
    kubectl get pods -n cloud-native-ecommerce 2>/dev/null || log_warn "Pods not yet created"
    
    log_success "Kubernetes workloads deployed"
    
    cd "$PROJECT_ROOT"
    
    print_summary
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        exit 1
    fi
}

main "$@"
