#!/bin/bash


SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

source "$SCRIPT_DIR/lib/common.sh"
source "$SCRIPT_DIR/lib/prerequisites.sh"

main() {
    log_step "01 - Infrastructure Deployment (Terraform)"
    
    # Check prerequisites
    check_prerequisites || exit 1
    check_gcp_auth || exit 1
    
    cd "$PROJECT_ROOT/infrastructure"
    
    # Export GCP credentials
    log_info "Setting up GCP credentials"
    export GOOGLE_CLOUD_KEYFILE_JSON="$PWD/account.json"
    export GOOGLE_APPLICATION_CREDENTIALS="$PWD/account.json"
    
    # Terraform init
    log_info "Initializing Terraform"
    if execute "terraform init" "Terraform initialized"; then
        :
    else
        log_error "Terraform init failed"
        print_summary
        exit 1
    fi
    
    # Terraform plan
    log_info "Planning infrastructure changes"
    if execute "terraform plan" "Terraform plan completed"; then
        :
    else
        log_warn "Terraform plan had warnings"
    fi
    
    # Terraform apply
    log_info "Applying infrastructure changes (this may take 10-15 minutes)"
    if execute "terraform apply -auto-approve" "Infrastructure deployed successfully"; then
        :
    else
        log_error "Terraform apply failed"
        print_summary
        exit 1
    fi
    
    # Generate outputs
    log_info "Generating output file"
    if execute "terraform output -json > output.json" "Output file generated"; then
        :
    else
        log_warn "Failed to generate output file"
    fi
    
    cd "$PROJECT_ROOT"
    
    print_summary
    
    if [[ ${#ERRORS[@]} -gt 0 ]]; then
        exit 1
    fi
}

main "$@"
