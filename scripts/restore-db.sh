#!/bin/bash

# Скрипт восстановления базы данных из бэкапа

set -e

if [ -z "$1" ]; then
    echo "❌ Ошибка: Укажите файл бэкапа"
    echo "Использование: $0 <backup-file.sql.gz>"
    exit 1
fi

BACKUP_FILE=$1

# Загрузка переменных окружения
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "📥 Восстановление базы данных из: $BACKUP_FILE"

# Проверка файла
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Ошибка: Файл $BACKUP_FILE не найден"
    exit 1
fi

# Проверка DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Ошибка: DATABASE_URL не установлен в .env файле"
    exit 1
fi

# Парсим DATABASE_URL
DB_URL=$(echo $DATABASE_URL | sed 's|postgresql://||')
DB_USER=$(echo $DB_URL | cut -d: -f1)
DB_PASS=$(echo $DB_URL | cut -d: -f2 | cut -d@ -f1)
DB_HOST=$(echo $DB_URL | cut -d@ -f2 | cut -d: -f1)
DB_PORT=$(echo $DB_URL | cut -d: -f3 | cut -d/ -f1)
DB_NAME=$(echo $DB_URL | cut -d/ -f2 | cut -d? -f1)

# Подтверждение
read -p "⚠️  ВНИМАНИЕ: Это удалит все данные в базе $DB_NAME. Продолжить? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Отменено"
    exit 1
fi

# Распаковка если нужно
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "📦 Распаковка бэкапа..."
    TEMP_FILE=$(mktemp)
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    BACKUP_FILE="$TEMP_FILE"
fi

# Восстановление
echo "📥 Восстановление базы данных..."
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$BACKUP_FILE"

# Очистка временного файла
if [ -n "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

echo "✅ База данных восстановлена!"

