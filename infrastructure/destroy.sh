
GCP_PROJECT=$(grep 'project' terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
GCP_ZONE=$(grep 'zone' terraform.tfvars | awk -F' = ' '{print $2}' | tr -d '"') && \
gcloud auth login --cred-file=account.json --quiet && \
gcloud config set project ${GCP_PROJECT} --quiet
gcloud compute  instances stop mongodb-keycloak-server --zone=$GCP_ZONE --quiet && \

kubectl delete ing --all -n cloud-native-ecommerce
kubectl delete pods --all -n cloud-native-ecommerce
kubectl delete svc --all -n cloud-native-ecommerce
kubectl delete secret --all -n cloud-native-ecommerce
kubectl delete configmap --all -n cloud-native-ecommerce
kubectl delete ns cloud-native-ecommerce

gcloud sql databases delete keycloak -i database-instance --quiet
gcloud sql databases delete order_db -i database-instance --quiet
gcloud sql databases delete cart_db -i database-instance --quiet

# gcloud container clusters delete workload-cluster --zone=$GCP_ZONE && \
terraform plan && \
terraform destroy