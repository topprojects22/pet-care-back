#!/bin/bash

# Скрипт очистки проекта (удаление временных файлов, кэша и т.д.)

set -e

echo "🧹 Очистка проекта..."

# Удаление dist
if [ -d "dist" ]; then
    echo "🗑️  Удаление dist..."
    rm -rf dist
fi

# Удаление node_modules/.cache
if [ -d "node_modules/.cache" ]; then
    echo "🗑️  Удаление кэша node_modules..."
    rm -rf node_modules/.cache
fi

# Удаление логов
if [ -d "logs" ]; then
    echo "🗑️  Удаление старых логов..."
    find logs -name "*.log" -mtime +7 -delete
fi

# Очистка coverage
if [ -d "coverage" ]; then
    echo "🗑️  Удаление coverage..."
    rm -rf coverage
fi

# Очистка .next (если есть)
if [ -d ".next" ]; then
    echo "🗑️  Удаление .next..."
    rm -rf .next
fi

# Очистка временных файлов
echo "🗑️  Удаление временных файлов..."
find . -name "*.tmp" -delete
find . -name "*.temp" -delete
find . -name ".DS_Store" -delete

# Очистка npm кэша (опционально)
read -p "Очистить npm кэш? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Очистка npm кэша..."
    npm cache clean --force
fi

echo "✅ Очистка завершена!"

