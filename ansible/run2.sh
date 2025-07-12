GCP_PROJECT=$(grep 'project' ../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
gcloud auth login --cred-file=account.json --quiet && \
POSTGRES_HOST_IP=$(gcloud sql instances describe "database-instance" --format=json | jq '.ipAddresses.[0].ipAddress' -r) && \
KC_DB_USERNAME="mugdho" && \
KC_DB_PASSWORD="admin" && \
ansible-playbook -i inventory/inventory.ini playbooks/deploy-mongodb-keycloak.yaml