#!/bin/bash

# Скрипт деплоя приложения
# Поддерживает разные окружения: development, staging, production
# Используется как вручную, так и через CI/CD

set -e

ENVIRONMENT=${1:-development}
IMAGE_TAG=${2:-latest}
DOCKER_COMPOSE_FILE="docker-compose.yml"
USE_EXISTING_IMAGE=${3:-false}  # Если true, использует существующий образ вместо сборки

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Проверка окружения
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    echo_error "Неверное окружение: $ENVIRONMENT"
    echo "Использование: $0 [development|staging|production] [image-tag] [use-existing-image]"
    exit 1
fi

echo_info "🚀 Начало деплоя в окружение: $ENVIRONMENT"

# Выбор docker-compose файла
if [ "$ENVIRONMENT" = "production" ]; then
    DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
fi

# Проверка наличия .env файла
if [ ! -f ".env" ]; then
    echo_warn ".env файл не найден!"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo_error ".env файл обязателен для production!"
        exit 1
    fi
    echo_warn "Создайте .env файл или используйте переменные окружения"
fi

# Проверка переменных окружения (если .env существует)
if [ -f ".env" ]; then
    echo_info "Проверка переменных окружения..."
    if ! grep -q "JWT_SECRET" .env || ! grep -q "DATABASE_URL" .env; then
        echo_error "Не все обязательные переменные окружения установлены!"
        exit 1
    fi
fi

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo_error "Docker не установлен!"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo_error "Docker Compose не установлен!"
    exit 1
fi

# Определяем команду docker-compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
else
    DOCKER_COMPOSE_CMD="docker-compose"
fi

# Сборка проекта (если не используется существующий образ)
if [ "$USE_EXISTING_IMAGE" != "true" ]; then
    echo_info "📦 Сборка проекта..."
    npm run build

    # Генерация Prisma Client
    echo_info "🔧 Генерация Prisma Client..."
    npx prisma generate

    # Сборка Docker образа
    echo_info "🐳 Сборка Docker образа..."
    docker build -t pet-care-backend:$IMAGE_TAG .
else
    echo_info "📦 Использование существующего образа: pet-care-backend:$IMAGE_TAG"
    if ! docker images | grep -q "pet-care-backend.*$IMAGE_TAG"; then
        echo_error "Образ pet-care-backend:$IMAGE_TAG не найден!"
        exit 1
    fi
fi

# Применение миграций БД (если нужно)
if [ -f ".env" ] && grep -q "DATABASE_URL" .env; then
    echo_info "🔄 Проверка миграций БД..."
    # Проверяем, есть ли новые миграции
    if npx prisma migrate status 2>/dev/null | grep -q "following migrations have not yet been applied"; then
        echo_warn "Обнаружены непримененные миграции"
        read -p "Применить миграции? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo_info "Применение миграций..."
            npx prisma migrate deploy
        fi
    else
        echo_info "Все миграции применены"
    fi
fi

# Остановка существующих контейнеров
echo_info "🛑 Остановка существующих контейнеров..."
$DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE down

# Очистка старых образов (опционально)
if [ "$ENVIRONMENT" = "production" ]; then
    echo_info "🧹 Очистка неиспользуемых образов..."
    docker image prune -f
fi

# Запуск новых контейнеров
echo_info "▶️  Запуск контейнеров..."
$DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE up -d

# Ожидание готовности приложения
echo_info "⏳ Ожидание готовности приложения..."
sleep 10

# Проверка health check
echo_info "🏥 Проверка health check..."
MAX_RETRIES=30
RETRY_COUNT=0
HEALTH_URL="http://localhost:5000/api/health"

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f $HEALTH_URL > /dev/null 2>&1; then
        echo_info "✅ Приложение успешно запущено!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "Попытка $RETRY_COUNT/$MAX_RETRIES..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo_error "Приложение не отвечает на health check!"
    echo "Проверьте логи: $DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE logs"
    echo ""
    echo "Последние логи приложения:"
    $DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE logs --tail=50 app
    exit 1
fi

# Проверка статуса контейнеров
echo_info "📊 Статус контейнеров:"
$DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE ps

echo_info "🎉 Деплой завершен успешно!"
echo ""
echo "Приложение доступно на: http://localhost:5000/api"
echo "Swagger документация: http://localhost:5000/api/docs"
echo "Health check: http://localhost:5000/api/health"
echo ""
echo "Полезные команды:"
echo "  Просмотр логов: $DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE logs -f"
echo "  Остановка: $DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE down"
echo "  Перезапуск: $DOCKER_COMPOSE_CMD -f $DOCKER_COMPOSE_FILE restart"

