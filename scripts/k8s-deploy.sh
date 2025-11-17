#!/bin/bash

# Скрипт деплоя в Kubernetes

set -e

ENVIRONMENT=${1:-production}
NAMESPACE=${2:-default}

echo "🚀 Деплой в Kubernetes (окружение: $ENVIRONMENT, namespace: $NAMESPACE)..."

# Проверка kubectl
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl не установлен"
    exit 1
fi

# Применение манифестов
echo "📦 Применение Kubernetes манифестов..."
kubectl apply -f k8s/configmap.yaml -n $NAMESPACE
kubectl apply -f k8s/redis-deployment.yaml -n $NAMESPACE
kubectl apply -f k8s/deployment.yaml -n $NAMESPACE
kubectl apply -f k8s/hpa.yaml -n $NAMESPACE

# Ожидание готовности
echo "⏳ Ожидание готовности подов..."
kubectl wait --for=condition=ready pod -l app=pet-care-backend -n $NAMESPACE --timeout=300s

echo "✅ Деплой завершен!"
echo ""
echo "Проверка статуса:"
kubectl get pods -n $NAMESPACE -l app=pet-care-backend
kubectl get services -n $NAMESPACE

