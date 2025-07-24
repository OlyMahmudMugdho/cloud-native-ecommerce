# /bin/bash
GCP_ZONE=$(grep 'zone' ../../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
gcloud compute ssh mongodb-server --zone=${GCP_ZONE}  --command="sudo apt update && curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh"
