#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Error tracking
declare -a ERRORS=()
declare -a WARNINGS=()

# Logging functions
log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ℹ️  $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ✅ $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ❌ $1" >&2
    ERRORS+=("$1")
}

log_warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} ⚠️  $1"
    WARNINGS+=("$1")
}

log_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}▶ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Execute command with logging
execute() {
    local cmd="$1"
    local description="$2"
    
    if [[ "${VERBOSE:-0}" == "1" ]]; then
        log_info "Executing: $cmd"
    fi
    
    if eval "$cmd"; then
        [[ -n "$description" ]] && log_success "$description"
        return 0
    else
        local exit_code=$?
        [[ -n "$description" ]] && log_error "$description (exit code: $exit_code)"
        return $exit_code
    fi
}

# Print summary
print_summary() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 DEPLOYMENT SUMMARY${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    if [[ ${#WARNINGS[@]} -eq 0 && ${#ERRORS[@]} -eq 0 ]]; then
        log_success "All operations completed successfully!"
    else
        if [[ ${#WARNINGS[@]} -gt 0 ]]; then
            echo -e "${YELLOW}Warnings (${#WARNINGS[@]}):${NC}"
            for warning in "${WARNINGS[@]}"; do
                echo -e "  ${YELLOW}⚠️${NC}  $warning"
            done
            echo ""
        fi
        
        if [[ ${#ERRORS[@]} -gt 0 ]]; then
            echo -e "${RED}Errors (${#ERRORS[@]}):${NC}"
            for error in "${ERRORS[@]}"; do
                echo -e "  ${RED}❌${NC} $error"
            done
            echo ""
        fi
    fi
    
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check if running in CI/CD
is_ci() {
    [[ -n "${CI:-}" ]] || [[ -n "${GITHUB_ACTIONS:-}" ]]
}
