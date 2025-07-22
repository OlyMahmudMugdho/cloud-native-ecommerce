cd ../k8s
kubectl apply -f namespace.yaml
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml
kubectl apply -f product/
kubectl apply -f inventory/
kubectl apply -f order/
kubectl apply -f gateway/
kubectl apply -f ecommerce-ui/
kubectl apply -f ingress.yaml

kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl patch svc argocd-server -n argocd -p \
'{
  "spec": {
    "type": "LoadBalancer",
    "ports": [
      {
        "name": "http",
        "port": 80,
        "protocol": "TCP",
        "targetPort": 8080
      },
      {
        "name": "https",
        "port": 443,
        "protocol": "TCP",
        "targetPort": 8080
      }
    ]
  }
}'

kubectl apply -f argocd

