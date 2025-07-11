# /bin/bash
cp ../../infrastructure/account.json ../account.json && \
GCP_PROJECT=$(grep 'project' ../../infrastructure/terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
echo $GCP_PROJECT 
gcloud auth login --cred-file=../account.json --quiet && \
gcloud config set project ${GCP_PROJECT} --quiet