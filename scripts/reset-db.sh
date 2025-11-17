#!/bin/bash

# Скрипт полного сброса базы данных

set -e

echo "⚠️  ВНИМАНИЕ: Это удалит ВСЕ данные из базы данных!"
read -p "Вы уверены? Введите 'yes' для подтверждения: " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Отменено"
    exit 1
fi

echo "🗄️  Сброс базы данных..."

# Загрузка переменных окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Проверка DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL не установлен в .env файле"
    exit 1
fi

# Парсим DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's|postgresql://||')
DB_USER=$(echo $DB_URL | cut -d: -f1)
DB_PASS=$(echo $DB_URL | cut -d: -f2 | cut -d@ -f1)
DB_HOST=$(echo $DB_URL | cut -d@ -f2 | cut -d: -f1)
DB_PORT=$(echo $DB_URL | cut -d: -f3 | cut -d/ -f1)
DB_NAME=$(echo $DB_URL | cut -d/ -f2 | cut -d? -f1)

# Удаление и создание базы данных
echo "🗑️  Удаление базы данных..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;"

echo "📝 Создание новой базы данных..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres \
    -c "CREATE DATABASE $DB_NAME;"

# Применение миграций
echo "🔄 Применение миграций..."
npx prisma migrate deploy

echo "✅ База данных сброшена и миграции применены!"

