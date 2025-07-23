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

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
kubectl create namespace ingress-nginx
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx
./apply_k8s.sh

kubectl create ns monitoring
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus-stack prometheus-community/kube-prometheus-stack \
  --namespace monitoring
kubectl patch svc prometheus-stack-grafana \
  -n monitoring \
  -p '{"spec": {"type": "LoadBalancer"}}'


sleep 60
./get_vars.sh

