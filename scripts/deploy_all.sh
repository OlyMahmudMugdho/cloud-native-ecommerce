#!/bin/bash

nohup ./install_linux_packages.sh > install.log 2>&1 &
cd ../infrastructure
./reset_tf.sh
./run.sh
cd ../ansible
./run1.sh
./run2.sh
./run3.sh
./run4.sh
cd ../scripts
./commands.sh
sleep 10
./commands.sh
sleep 10
./commands.sh
sleep 10
./commands.sh
sleep 10
./commands.sh
sleep 10
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
kubectl create namespace ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx
./apply_k8s.sh

sleep 60
./get_vars.sh