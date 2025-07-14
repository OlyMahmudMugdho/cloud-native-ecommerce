cd ../k8s
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f product/
kubectl apply -f inventory/
kubectl apply -f order/
kubectl apply -f gateway/
kubectl apply -f ingress.yaml