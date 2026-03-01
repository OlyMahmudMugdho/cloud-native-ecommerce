.PHONY: help check 01-infrastructure 02-configuration 03-kubernetes 04-monitoring 05-finalize deploy-all destroy-monitoring destroy-kubernetes destroy-infrastructure destroy-all

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo ""
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  Cloud-Native E-commerce Deployment$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(GREEN)Deployment Stages:$(NC)"
	@echo "  $(YELLOW)make check$(NC)                  - Validate prerequisites"
	@echo "  $(YELLOW)make 01-infrastructure$(NC)      - Deploy GCP infrastructure (Terraform)"
	@echo "  $(YELLOW)make 02-configuration$(NC)       - Configure VMs (Ansible)"
	@echo "  $(YELLOW)make 03-kubernetes$(NC)          - Deploy Kubernetes workloads"
	@echo "  $(YELLOW)make 04-monitoring$(NC)          - Deploy monitoring stack (Prometheus, Grafana, Zipkin)"
	@echo "  $(YELLOW)make 05-finalize$(NC)            - Extract variables and set GitHub secrets"
	@echo "  $(YELLOW)make deploy-all$(NC)             - Run all deployment stages"
	@echo ""
	@echo "$(RED)Cleanup:$(NC)"
	@echo "  $(YELLOW)make destroy-monitoring$(NC)     - Destroy monitoring stack"
	@echo "  $(YELLOW)make destroy-kubernetes$(NC)     - Destroy Kubernetes workloads"
	@echo "  $(YELLOW)make destroy-infrastructure$(NC) - Destroy GCP infrastructure"
	@echo "  $(YELLOW)make destroy-all$(NC)            - Destroy everything (with confirmation)"
	@echo ""
	@echo "$(BLUE)Options:$(NC)"
	@echo "  $(YELLOW)VERBOSE=1$(NC)                   - Enable verbose output"
	@echo "  $(YELLOW)FORCE=1$(NC)                     - Skip confirmation prompts (destroy only)"
	@echo ""
	@echo "$(BLUE)Examples:$(NC)"
	@echo "  make deploy-all VERBOSE=1"
	@echo "  make 01-infrastructure"
	@echo "  make destroy-all FORCE=1"
	@echo ""
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""

check: ## Validate prerequisites
	@echo "$(BLUE)Checking prerequisites...$(NC)"
	@bash -c "source deploy/lib/common.sh && source deploy/lib/prerequisites.sh && check_prerequisites"

01-infrastructure: ## Deploy GCP infrastructure (Terraform)
	@echo "$(BLUE)Starting infrastructure deployment...$(NC)"
	@VERBOSE=$(VERBOSE) ./deploy/01-infrastructure.sh

02-configuration: ## Configure VMs with Ansible
	@echo "$(BLUE)Starting configuration management...$(NC)"
	@VERBOSE=$(VERBOSE) ./deploy/02-configuration.sh

03-kubernetes: ## Deploy Kubernetes workloads
	@echo "$(BLUE)Starting Kubernetes deployment...$(NC)"
	@VERBOSE=$(VERBOSE) ./deploy/03-kubernetes.sh

04-monitoring: ## Deploy monitoring stack
	@echo "$(BLUE)Starting monitoring deployment...$(NC)"
	@VERBOSE=$(VERBOSE) ./deploy/04-monitoring.sh

05-finalize: ## Extract variables and finalize deployment
	@echo "$(BLUE)Finalizing deployment...$(NC)"
	@VERBOSE=$(VERBOSE) ./deploy/05-finalize.sh

deploy-all: ## Run all deployment stages
	@echo ""
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  Starting Complete Deployment$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@$(MAKE) check
	@$(MAKE) 01-infrastructure
	@$(MAKE) 02-configuration
	@$(MAKE) 03-kubernetes
	@$(MAKE) 04-monitoring
	@$(MAKE) 05-finalize
	@echo ""
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(GREEN)  ✅ Complete Deployment Finished!$(NC)"
	@echo "$(GREEN)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(YELLOW)Check scripts/vars.txt for deployment details$(NC)"
	@echo ""

destroy-monitoring: ## Destroy monitoring stack
	@echo "$(RED)Destroying monitoring stack...$(NC)"
	@FORCE=$(FORCE) ./deploy/destroy.sh monitoring

destroy-kubernetes: ## Destroy Kubernetes workloads
	@echo "$(RED)Destroying Kubernetes workloads...$(NC)"
	@FORCE=$(FORCE) ./deploy/destroy.sh kubernetes

destroy-infrastructure: ## Destroy GCP infrastructure
	@echo "$(RED)Destroying infrastructure...$(NC)"
	@FORCE=$(FORCE) ./deploy/destroy.sh infrastructure

destroy-all: ## Destroy everything
	@echo "$(RED)Destroying complete deployment...$(NC)"
	@FORCE=$(FORCE) ./deploy/destroy.sh all
