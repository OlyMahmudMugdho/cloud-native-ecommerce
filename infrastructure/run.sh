GOOGLE_CLOUD_KEYFILE_JSON=account.json && \
terraform init && \
terraform plan && \
terraform apply -auto-approve &&\
terraform output -json > output.json