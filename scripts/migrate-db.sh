#!/bin/bash

# Скрипт для применения миграций базы данных

set -e

ENVIRONMENT=${1:-development}

echo "🗄️  Применение миграций базы данных (окружение: $ENVIRONMENT)..."

# Проверка .env файла
if [ ! -f .env ]; then
    echo "❌ .env файл не найден"
    exit 1
fi

# Загрузка переменных окружения
export $(cat .env | grep -v '^#' | xargs)

# Проверка DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL не установлен в .env файле"
    exit 1
fi

# Генерация Prisma клиента
echo "🔧 Генерация Prisma клиента..."
npx prisma generate

# Применение миграций
if [ "$ENVIRONMENT" = "production" ]; then
    echo "📥 Применение миграций (production)..."
    npx prisma migrate deploy
else
    echo "📥 Применение миграций (development)..."
    npx prisma migrate dev
fi

echo "✅ Миграции применены успешно!"

