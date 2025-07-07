# /bin/bash
gcloud compute ssh mongodb-keycloak-server --zone=${GCP_ZONE} --command="sudo apt update && curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh"
