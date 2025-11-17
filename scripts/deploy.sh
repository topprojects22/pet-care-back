#!/bin/bash

# Скрипт деплоя приложения
# Поддерживает разные окружения: development, staging, production

set -e

ENVIRONMENT=${1:-development}
IMAGE_TAG=${2:-latest}
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка окружения
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo_error "Неверное окружение: $ENVIRONMENT"
    echo "Использование: $0 [development|staging|production] [image-tag]"
    exit 1
fi

echo_info "🚀 Начало деплоя в окружение: $ENVIRONMENT"

# Выбор docker-compose файла
if [ "$ENVIRONMENT" = "production" ]; then
    DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
fi

# Проверка наличия .env файла
if [ ! -f ".env" ]; then
    echo_error ".env файл не найден!"
    echo "Скопируйте .env.example в .env и настройте переменные окружения"
    exit 1
fi

# Проверка переменных окружения
echo_info "Проверка переменных окружения..."
if ! grep -q "JWT_SECRET" .env || ! grep -q "DATABASE_URL" .env; then
    echo_error "Не все обязательные переменные окружения установлены!"
    exit 1
fi

# Сборка проекта
echo_info "📦 Сборка проекта..."
npm run build

# Сборка Docker образа
echo_info "🐳 Сборка Docker образа..."
docker build -t pet-care-backend:$IMAGE_TAG .

# Остановка существующих контейнеров
echo_info "🛑 Остановка существующих контейнеров..."
docker-compose -f $DOCKER_COMPOSE_FILE down

# Запуск новых контейнеров
echo_info "▶️  Запуск контейнеров..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d

# Ожидание готовности приложения
echo_info "⏳ Ожидание готовности приложения..."
sleep 10

# Проверка health check
echo_info "🏥 Проверка health check..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        echo_info "✅ Приложение успешно запущено!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Попытка $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo_error "Приложение не отвечает на health check!"
    echo "Проверьте логи: docker-compose -f $DOCKER_COMPOSE_FILE logs"
    exit 1
fi

echo_info "🎉 Деплой завершен успешно!"
echo ""
echo "Приложение доступно на: http://localhost:5000/api"
echo "Swagger документация: http://localhost:5000/api/docs"
echo ""
echo "Просмотр логов: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"

