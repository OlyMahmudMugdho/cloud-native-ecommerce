
GCP_ZONE=$(grep 'zone' ../../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
gcloud container clusters get-credentials workload-cluster --zone $GCP_ZONE