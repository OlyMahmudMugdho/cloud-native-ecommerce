#!/bin/bash


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/prerequisites.sh"

main() {
    log_step "05 - Finalization & Variable Extraction"
    
    cd "$PROJECT_ROOT/scripts"
    
    # Clean up old vars file
    rm -f vars.txt
    touch vars.txt
    
    log_info "Extracting deployment variables"
    log_warn "Note: LoadBalancers may take 5-10 minutes to provision IPs"
    
    # Extract Kubernetes service IPs
    log_info "Getting Kubernetes service IPs"
    LB_IP=$(kubectl get ing -n cloud-native-ecommerce 2>/dev/null | grep ecommerce-ingress | awk '{print $4}' || echo "pending")
    INVENTORY_IP=$(kubectl get svc -n cloud-native-ecommerce 2>/dev/null | grep inventory-service | awk '{print $4}' || echo "pending")
    ECOMMERCE_UI_IP=$(kubectl get svc -n cloud-native-ecommerce 2>/dev/null | grep ecommerce-ui-service | awk '{print $4}' || echo "pending")
    
    # Extract infrastructure IPs
    OUTPUT_JSON="../infrastructure/output.json"
    SQL_INSTANCE_EXTERNAL_IP=$(jq -r '.sql_instance_external_ip.value' "$OUTPUT_JSON")
    MONGODB_KEYCLOAK_VM_EXTERNAL_IP=$(jq -r '.mongodb_vm_external_ip.value' "$OUTPUT_JSON")
    REDIS_KAFKA_VM_IP=$(jq -r '.redis_kafka_vm_ip.value' "$OUTPUT_JSON")
    KEYCLOAK_IP=$(jq -r '.mongodb_vm_external_ip.value' "$OUTPUT_JSON")
    
    # Extract ArgoCD credentials
    log_info "Getting ArgoCD credentials"
    ARGOCD_PASSWORD=$(kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" 2>/dev/null | base64 -d || echo "not-available")
    ARGOCD_SERVER=$(kubectl get svc -n argocd 2>/dev/null | grep argocd-server | grep LoadBalancer | awk '{print $4}' || echo "pending")
    ARGOCD_USERNAME="admin"
    
    # Write to vars.txt
    log_info "Writing variables to vars.txt"
    {
        echo "LB_IP=$LB_IP"
        echo "INVENTORY_IP=$INVENTORY_IP"
        echo "ECOMMERCE_UI_IP=$ECOMMERCE_UI_IP"
        echo "KEYCLOAK_IP=$KEYCLOAK_IP"
        echo "MONGODB_KEYCLOAK_VM_EXTERNAL_IP=$MONGODB_KEYCLOAK_VM_EXTERNAL_IP"
        echo "REDIS_KAFKA_VM_IP=$REDIS_KAFKA_VM_IP"
        echo "SQL_INSTANCE_EXTERNAL_IP=$SQL_INSTANCE_EXTERNAL_IP"
        echo "ARGOCD_USERNAME=$ARGOCD_USERNAME"
        echo "ARGOCD_SERVER=$ARGOCD_SERVER"
        echo "ARGOCD_PASSWORD=$ARGOCD_PASSWORD"
    } > vars.txt
    
    log_success "Variables written to scripts/vars.txt"
    
    # Set GitHub secrets if gh CLI is available
    if command -v gh &> /dev/null; then
        log_info "Setting GitHub secrets"
        
        gh secret set KEYCLOAK_IP --body "$KEYCLOAK_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set KEYCLOAK_IP secret"
        gh secret set LB_IP --body "$LB_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set LB_IP secret"
        gh secret set MONGODB_KEYCLOAK_VM_EXTERNAL_IP --body "$MONGODB_KEYCLOAK_VM_EXTERNAL_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set MONGODB_KEYCLOAK_VM_EXTERNAL_IP secret"
        gh secret set REDIS_KAFKA_VM_IP --body "$REDIS_KAFKA_VM_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set REDIS_KAFKA_VM_IP secret"
        gh secret set SQL_INSTANCE_EXTERNAL_IP --body "$SQL_INSTANCE_EXTERNAL_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set SQL_INSTANCE_EXTERNAL_IP secret"
        gh secret set INVENTORY_HOST --body "$INVENTORY_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set INVENTORY_HOST secret"
        gh secret set ARGOCD_SERVER --body "$ARGOCD_SERVER" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set ARGOCD_SERVER secret"
        gh secret set ARGOCD_USERNAME --body "$ARGOCD_USERNAME" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set ARGOCD_USERNAME secret"
        gh secret set ARGOCD_PASSWORD --body "$ARGOCD_PASSWORD" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions 2>/dev/null || log_warn "Failed to set ARGOCD_PASSWORD secret"
        
        log_success "GitHub secrets updated"
    else
        log_warn "gh CLI not found, skipping GitHub secrets update"
    fi
    
    # Display deployment summary
    log_step "Deployment Information"
    
    echo -e "${GREEN}Infrastructure:${NC}"
    echo -e "  SQL Instance:     $SQL_INSTANCE_EXTERNAL_IP"
    echo -e "  MongoDB:          $MONGODB_KEYCLOAK_VM_EXTERNAL_IP"
    echo -e "  Redis/Kafka:      $REDIS_KAFKA_VM_IP"
    echo ""
    echo -e "${GREEN}Kubernetes Services:${NC}"
    echo -e "  Load Balancer:    $LB_IP"
    echo -e "  Inventory:        $INVENTORY_IP"
    echo -e "  E-commerce UI:    $ECOMMERCE_UI_IP"
    echo ""
    echo -e "${GREEN}ArgoCD:${NC}"
    echo -e "  Server:           $ARGOCD_SERVER"
    echo -e "  Username:         $ARGOCD_USERNAME"
    echo -e "  Password:         $ARGOCD_PASSWORD"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    print_summary
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        exit 1
    fi
}

main "$@"
