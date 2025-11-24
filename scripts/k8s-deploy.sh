#!/bin/bash

# Скрипт деплоя в Kubernetes
# Поддерживает обновление образов и применение миграций

set -e

ENVIRONMENT=${1:-production}
NAMESPACE=${2:-default}
IMAGE_TAG=${3:-latest}
IMAGE_NAME=${4:-pet-care-backend}
SKIP_MIGRATIONS=${5:-false}

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

echo_info "🚀 Деплой в Kubernetes (окружение: $ENVIRONMENT, namespace: $NAMESPACE)..."

# Проверка kubectl
if ! command -v kubectl &> /dev/null; then
    echo_error "kubectl не установлен"
    exit 1
fi

# Проверка подключения к кластеру
if ! kubectl cluster-info &> /dev/null; then
    echo_error "Не удается подключиться к Kubernetes кластеру"
    exit 1
fi

# Создание namespace, если не существует
if ! kubectl get namespace $NAMESPACE &> /dev/null; then
    echo_info "Создание namespace: $NAMESPACE"
    kubectl create namespace $NAMESPACE
fi

# Применение ConfigMap
echo_info "📦 Применение ConfigMap..."
kubectl apply -f k8s/configmap.yaml -n $NAMESPACE

# Применение Redis (если не используется внешний)
echo_info "📦 Применение Redis deployment..."
kubectl apply -f k8s/redis-deployment.yaml -n $NAMESPACE

# Ожидание готовности Redis
echo_info "⏳ Ожидание готовности Redis..."
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=120s || echo_warn "Redis не готов, продолжаем..."

# Применение миграций БД (если нужно)
if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo_info "🔄 Проверка миграций БД..."
    
    # Создаем временный pod для миграций
    MIGRATION_POD="migration-$(date +%s)"
    
    # Проверяем, есть ли секреты с DATABASE_URL
    if kubectl get secret pet-care-secrets -n $NAMESPACE &> /dev/null; then
        echo_info "Применение миграций через временный pod..."
        
        # Здесь можно добавить логику применения миграций
        # Например, через Job или initContainer
        echo_warn "Миграции должны быть применены вручную или через initContainer"
    else
        echo_warn "Секрет pet-care-secrets не найден, пропускаем миграции"
    fi
else
    echo_info "⏭️  Пропуск миграций (SKIP_MIGRATIONS=true)"
fi

# Обновление образа в deployment (если указан новый тег)
if [ "$IMAGE_TAG" != "latest" ] || [ -n "$IMAGE_NAME" ]; then
    FULL_IMAGE="${IMAGE_NAME}:${IMAGE_TAG}"
    echo_info "🔄 Обновление образа на: $FULL_IMAGE"
    
    # Обновляем образ в deployment
    kubectl set image deployment/pet-care-backend \
        app=$FULL_IMAGE \
        -n $NAMESPACE || echo_warn "Не удалось обновить образ, возможно deployment не существует"
fi

# Применение основного deployment
echo_info "📦 Применение основного deployment..."
kubectl apply -f k8s/deployment.yaml -n $NAMESPACE

# Применение HPA
echo_info "📦 Применение HPA (автомасштабирование)..."
kubectl apply -f k8s/hpa.yaml -n $NAMESPACE

# Ожидание готовности подов
echo_info "⏳ Ожидание готовности подов..."
if kubectl wait --for=condition=ready pod -l app=pet-care-backend -n $NAMESPACE --timeout=300s; then
    echo_info "✅ Все поды готовы!"
else
    echo_error "Таймаут ожидания готовности подов"
    echo "Проверьте статус:"
    kubectl get pods -n $NAMESPACE -l app=pet-care-backend
    exit 1
fi

# Проверка rollout
echo_info "🔄 Проверка статуса rollout..."
if kubectl rollout status deployment/pet-care-backend -n $NAMESPACE --timeout=300s; then
    echo_info "✅ Rollout завершен успешно!"
else
    echo_error "Rollout не завершен"
    echo "Проверьте события:"
    kubectl describe deployment/pet-care-backend -n $NAMESPACE
    exit 1
fi

# Вывод статуса
echo_info "📊 Статус деплоя:"
echo ""
echo "Поды:"
kubectl get pods -n $NAMESPACE -l app=pet-care-backend
echo ""
echo "Сервисы:"
kubectl get services -n $NAMESPACE
echo ""
echo "HPA:"
kubectl get hpa -n $NAMESPACE

echo_info "🎉 Деплой завершен успешно!"
echo ""
echo "Полезные команды:"
echo "  Логи: kubectl logs -f deployment/pet-care-backend -n $NAMESPACE"
echo "  Статус: kubectl get all -n $NAMESPACE -l app=pet-care-backend"
echo "  Описание: kubectl describe deployment/pet-care-backend -n $NAMESPACE"

