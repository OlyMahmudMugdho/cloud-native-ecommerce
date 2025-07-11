chmod +x scripts/* && \
GCP_PROJECT=$(grep 'project' ../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
GCP_ZONE=$(grep 'zone' ../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
ansible-playbook -i inventory/inventory.ini playbooks/gcp_login.yaml && \
ansible-playbook -i inventory/inventory.ini playbooks/setup-redis-kafka.yaml && \
ansible-playbook -i inventory/inventory.ini playbooks/setup-mongodb.yaml
