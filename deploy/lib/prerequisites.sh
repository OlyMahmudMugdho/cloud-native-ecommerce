#!/bin/bash

# Required tools
REQUIRED_TOOLS=(
    "jq:JSON processor"
    "yq:YAML processor"
    "sponge:moreutils - file rewriter"
    "ansible:Configuration management"
    "ansible-playbook:Ansible playbook runner"
    "terraform:Infrastructure as Code"
    "helm:Kubernetes package manager"
    "kubectl:Kubernetes CLI"
    "gcloud:Google Cloud SDK"
)

check_prerequisites() {
    local missing=()
    local found=()
    
    log_step "Checking Prerequisites"
    
    for tool_info in "${REQUIRED_TOOLS[@]}"; do
        IFS=':' read -r tool description <<< "$tool_info"
        
        if command -v "$tool" &> /dev/null; then
            found+=("$tool")
            if [[ "${VERBOSE:-0}" == "1" ]]; then
                log_success "$tool ($description) - found"
            fi
        else
            missing+=("$tool ($description)")
            log_error "$tool ($description) - not found"
        fi
    done
    
    if [[ ${#missing[@]} -eq 0 ]]; then
        log_success "All prerequisites satisfied (${#found[@]}/${#REQUIRED_TOOLS[@]})"
        return 0
    else
        log_error "Missing ${#missing[@]} required tool(s):"
        for tool in "${missing[@]}"; do
            echo -e "  ${RED}✗${NC} $tool"
        done
        echo ""
        log_info "Install missing tools and try again"
        return 1
    fi
}

check_file_exists() {
    local file="$1"
    local description="$2"
    
    if [[ ! -f "$file" ]]; then
        log_error "$description not found: $file"
        return 1
    fi
    
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        log_success "$description found: $file"
    fi
    return 0
}

check_gcp_auth() {
    if [[ ! -f "infrastructure/account.json" ]]; then
        log_error "GCP service account key not found: infrastructure/account.json"
        return 1
    fi
    
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        log_success "GCP service account key found"
    fi
    return 0
}
