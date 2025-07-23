rm vars.txt
touch vars.txt
LB_IP=$(kubectl get ing -n cloud-native-ecommerce | grep ecommerce-ingress | awk '{print $4}')
INVENTORY_IP=$(kubectl get svc -n cloud-native-ecommerce | grep  inventory-service | awk '{print $4}')
ECOMMERCE_UI_IP=$(kubectl get svc -n cloud-native-ecommerce | grep  ecommerce-ui-service | awk '{print $4}')

OUTPUT_JSON="../infrastructure/output.json"


SQL_INSTANCE_EXTERNAL_IP=$(jq -r '.sql_instance_external_ip.value' "$OUTPUT_JSON")
MONGODB_KEYCLOAK_VM_EXTERNAL_IP=$(jq -r '.mongodb_keycloak_vm_external_ip.value' "$OUTPUT_JSON")
REDIS_KAFKA_VM_IP=$(jq -r '.redis_kafka_vm_ip.value' "$OUTPUT_JSON")
KEYCLOAK_IP=$(jq -r '.mongodb_keycloak_vm_external_ip.value' "$OUTPUT_JSON")



ARGOCD_PASSWORD=$(kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath="{.data.password}" | base64 -d && echo)
ARGOCD_SERVER=$(kubectl get svc -n argocd | grep argocd-server | grep LoadBalancer | awk '{print $4}')
# ARGOCD_SERVER="https://$ARGOCD_IP"
ARGOCD_APP=cloud-native-ecommerce
ARGOCD_USERNAME=admin

echo "LB_IP=$LB_IP" >> vars.txt
echo "INVENTORY_IP=$INVENTORY_IP" >> vars.txt
echo "ECOMMERCE_UI_IP=$ECOMMERCE_UI_IP" >> vars.txt

echo "KEYCLOAK_IP=$KEYCLOAK_IP" >> vars.txt
echo "MONGODB_KEYCLOAK_VM_EXTERNAL_IP=$MONGODB_KEYCLOAK_VM_EXTERNAL_IP" >> vars.txt
echo "REDIS_KAFKA_VM_IP=$REDIS_KAFKA_VM_IP" >> vars.txt
echo "SQL_INSTANCE_EXTERNAL_IP=$SQL_INSTANCE_EXTERNAL_IP" >> vars.txt

echo "ARGOCD_USERNAME=$ARGOCD_USERNAME" >> vars.txt
echo "ARGOCD_IP=$ARGOCD_IP" >> vars.txt
echo "ARGOCD_SERVER=$ARGOCD_SERVER" >> vars.txt
echo "ARGOCD_PASSWORD=$ARGOCD_PASSWORD" >> vars.txt


gh secret set KEYCLOAK_IP --body "$KEYCLOAK_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions

gh secret set LB_IP --body "$LB_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions

gh secret set MONGODB_KEYCLOAK_VM_EXTERNAL_IP --body "$MONGODB_KEYCLOAK_VM_EXTERNAL_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions

gh secret set REDIS_KAFKA_VM_IP --body "$REDIS_KAFKA_VM_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions

gh secret set SQL_INSTANCE_EXTERNAL_IP --body "$SQL_INSTANCE_EXTERNAL_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions

gh secret set INVENTORY_HOST --body "$INVENTORY_IP" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions


gh secret set ARGOCD_SERVER --body "$ARGOCD_SERVER" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions
gh secret set ARGOCD_USERNAME --body "$ARGOCD_USERNAME" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions
gh secret set ARGOCD_PASSWORD --body "$ARGOCD_PASSWORD" -r "OlyMahmudMugdho/cloud-native-ecommerce" -a actions
