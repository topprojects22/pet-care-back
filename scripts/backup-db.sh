#!/bin/bash

# Скрипт резервного копирования базы данных

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/petcare_backup_$TIMESTAMP.sql"

# Загрузка переменных окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "💾 Резервное копирование базы данных..."

# Создаем директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# Проверка DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлен в .env файле"
    exit 1
fi

# Парсим DATABASE_URL
# Формат: postgresql://user:password@host:port/database
DB_URL=$(echo $DATABASE_URL | sed 's|postgresql://||')
DB_USER=$(echo $DB_URL | cut -d: -f1)
DB_PASS=$(echo $DB_URL | cut -d: -f2 | cut -d@ -f1)
DB_HOST=$(echo $DB_URL | cut -d@ -f2 | cut -d: -f1)
DB_PORT=$(echo $DB_URL | cut -d: -f3 | cut -d/ -f1)
DB_NAME=$(echo $DB_URL | cut -d/ -f2 | cut -d? -f1)

# Экспорт базы данных
echo "📤 Создание бэкапа..."
PGPASSWORD=$DB_PASS pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME \
    --no-owner --no-acl > "$BACKUP_FILE"

# Сжатие бэкапа
echo "🗜️  Сжатие бэкапа..."
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

# Размер файла
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Бэкап создан: $BACKUP_FILE ($FILE_SIZE)"

# Удаление старых бэкапов (старше 7 дней)
echo "🧹 Очистка старых бэкапов (старше 7 дней)..."
find "$BACKUP_DIR" -name "petcare_backup_*.sql.gz" -mtime +7 -delete

echo "✅ Готово!"

