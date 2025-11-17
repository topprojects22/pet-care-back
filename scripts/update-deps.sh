#!/bin/bash

# Скрипт обновления зависимостей

set -e

echo "📦 Обновление зависимостей..."

# Проверка outdated пакетов
echo "🔍 Проверка устаревших пакетов..."
npm outdated

echo ""
read -p "Обновить все зависимости? (y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "⬆️  Обновление зависимостей..."
    npm update
    
    echo "🔧 Обновление Prisma клиента..."
    npm run prisma:generate
    
    echo "✅ Зависимости обновлены!"
else
    echo "❌ Отменено"
fi

