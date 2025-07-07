chmod +x */**
ansible-playbook -i inventory/inventory.ini playbooks/gcp_login.yaml && \
ansible-playbook -i inventory/inventory.ini playbooks/setup-redis-kafka.yaml && \
ansible-playbook -i inventory/inventory.ini playbooks/setup-mongodb.yaml