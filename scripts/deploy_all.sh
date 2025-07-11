#!/bin/bash

# Navigate to the scripts directory and execute gcp_login.sh
cd ansible/scripts/ && \
sh gcp_login.sh && \
pwd &&

# Navigate to the infrastructure directory
cd ../../infrastructure && \
pwd && \

# Make all shell scripts executable
chmod +x *.sh && \

# Export the environment variable and execute reset_tf.sh
sh reset_tf.sh && \

# Execute run.sh with the environment variable
sh run.sh && \

# Navigate to the ansible directory and execute run.sh
cd ../ansible && \
chmod +x *.sh && \
sh run.sh
