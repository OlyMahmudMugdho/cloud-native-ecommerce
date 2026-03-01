# Deployment Scripts

This directory contains the automated deployment orchestration scripts for the Cloud-Native E-commerce platform.

## Structure

```
deploy/
├── lib/
│   ├── common.sh           # Shared logging and utility functions
│   └── prerequisites.sh    # Tool validation functions
├── 01-infrastructure.sh    # Terraform infrastructure deployment
├── 02-configuration.sh     # Ansible VM configuration
├── 03-kubernetes.sh        # Kubernetes workloads deployment
├── 04-monitoring.sh        # Monitoring stack deployment
├── 05-finalize.sh          # Variable extraction and finalization
└── destroy.sh              # Cleanup and destruction orchestration
```

## Usage

**Do not run these scripts directly.** Use the Makefile in the project root:

```bash
# From project root
make help                   # Show all available commands
make check                  # Validate prerequisites
make deploy-all             # Run complete deployment
make 01-infrastructure      # Run specific stage
```

## Script Details

### lib/common.sh
Provides shared functions:
- `log_info()`, `log_success()`, `log_error()`, `log_warn()` - Colored logging with timestamps
- `log_step()` - Section headers
- `execute()` - Command execution with error handling
- `print_summary()` - Deployment summary with error/warning counts
- Error and warning tracking arrays

### lib/prerequisites.sh
Validates required tools:
- jq, yq, sponge, ansible, terraform, helm, kubectl, gcloud
- GCP authentication file check
- File existence validation

### 01-infrastructure.sh
- Exports GCP credentials
- Runs Terraform init, plan, apply
- Generates output.json with resource details
- Duration: 10-15 minutes

### 02-configuration.sh
- Runs Ansible playbooks for VM setup
- Configures MongoDB, Redis, Kafka
- Fetches Kubernetes credentials
- Updates ConfigMap with infrastructure IPs
- Duration: 5-10 minutes

### 03-kubernetes.sh
- Installs ingress-nginx
- Deploys application workloads
- Installs ArgoCD
- Waits for pods to be ready
- Duration: 5-10 minutes

### 04-monitoring.sh
- Installs Prometheus & Grafana
- Installs Zipkin
- Patches services to LoadBalancer
- Duration: 5-7 minutes

### 05-finalize.sh
- Extracts LoadBalancer IPs
- Retrieves ArgoCD credentials
- Writes vars.txt
- Sets GitHub secrets (if gh CLI available)
- Duration: 1-2 minutes

### destroy.sh
- Supports targeted destruction (monitoring, kubernetes, infrastructure)
- Confirmation prompts for safety
- Can destroy all resources
- Supports FORCE=1 to skip confirmations

## Environment Variables

- `VERBOSE=1` - Enable detailed output
- `FORCE=1` - Skip confirmation prompts (destroy only)

## Error Handling

Scripts use "continue with warnings" approach:
- Non-critical errors logged as warnings
- Deployment continues
- Summary shows all errors and warnings at end
- Exit code 1 if any errors occurred

## Development

When modifying scripts:
1. Source common.sh for logging functions
2. Use `execute()` for command execution
3. Call `print_summary()` at end
4. Make scripts executable: `chmod +x script.sh`
5. Test with `VERBOSE=1` for debugging
