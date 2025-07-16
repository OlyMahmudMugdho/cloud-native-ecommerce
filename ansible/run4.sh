# update CART_DB_URI

yq -y ".data.CART_DB_URI = \"jdbc:postgresql://$(jq -r '.sql_instance_external_ip.value' ../infrastructure/output.json):5432/cart_db\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml

# update ORDER_DB_URI
yq -y ".data.ORDER_DB_URI = \"jdbc:postgresql://$(jq -r '.sql_instance_external_ip.value' ../infrastructure/output.json):5432/order_db\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml

# update MONGO_URL
yq -y ".data.MONGO_URL = \"mongodb://$(jq -r '.mongodb_keycloak_vm_external_ip.value' ../infrastructure/output.json):27017\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml

# update REDIS_URL
yq -y ".data.REDIS_URL = \"redis://$(jq -r '.redis_kafka_vm_ip.value' ../infrastructure/output.json):6379\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml

# update KAFKA_BROKER
yq -y ".data.KAFKA_BROKER = \"$(jq -r '.redis_kafka_vm_ip.value' ../infrastructure/output.json):9092\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml

# update REDIS_HOST
yq -y ".data.REDIS_HOST = \"$(jq -r '.redis_kafka_vm_ip.value' ../infrastructure/output.json)\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml

# update JWT_ISSUER_URI
yq -y ".data.JWT_ISSUER_URI = \"http://$(jq -r '.mongodb_keycloak_vm_external_ip.value' ../infrastructure/output.json):8080/realms/cloud-native-ecommerce\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml

# update JWT_SET_URI
yq -y ".data.JWT_SET_URI = \"http://$(jq -r '.mongodb_keycloak_vm_external_ip.value' ../infrastructure/output.json):8080/realms/cloud-native-ecommerce/protocol/openid-connect/certs\"" ../k8s/configmap.yaml | sponge ../k8s/configmap.yaml