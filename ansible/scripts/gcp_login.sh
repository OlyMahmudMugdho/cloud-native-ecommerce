# /bin/bash
gcloud auth revoke
gcloud auth login --cred-file=../account.json
gcloud config set project ${GCP_PROJECT}