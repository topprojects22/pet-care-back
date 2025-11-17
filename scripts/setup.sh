#!/bin/bash

# Скрипт первоначальной настройки проекта

set -e

echo "🚀 Настройка проекта Pet Care Backend..."

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не установлен. Установите Node.js >= 18.0.0"
    exit 1
fi

# Создание .env файла
if [ ! -f .env ]; then
    echo "📝 Создание .env файла..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env файл создан из .env.example"
        echo "⚠️  Не забудьте настроить переменные окружения в .env файле!"
    else
        echo "⚠️  .env.example не найден, создайте .env вручную"
    fi
else
    echo "✅ .env файл уже существует"
fi

# Генерация JWT_SECRET если не установлен
if ! grep -q "JWT_SECRET=" .env || [ ${#JWT_SECRET} -lt 32 ]; then
    echo "🔐 Генерация JWT_SECRET..."
    NEW_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    if grep -q "JWT_SECRET=" .env; then
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$NEW_SECRET/" .env
    else
        echo "JWT_SECRET=$NEW_SECRET" >> .env
    fi
    echo "✅ JWT_SECRET сгенерирован и добавлен в .env"
fi

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install

# Генерация Prisma клиента
echo "🔧 Генерация Prisma клиента..."
npm run prisma:generate

# Применение миграций (если база данных доступна)
read -p "Применить миграции базы данных? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Применение миграций..."
    npm run prisma:migrate || echo "⚠️  Не удалось применить миграции. Проверьте DATABASE_URL в .env"
fi

# Заполнение базы данных (опционально)
read -p "Заполнить базу данных тестовыми данными? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌱 Заполнение базы данных..."
    npm run seed || echo "⚠️  Не удалось заполнить базу данных"
fi

echo ""
echo "✅ Настройка завершена!"
echo ""
echo "Следующие шаги:"
echo "1. Проверьте настройки в .env файле"
echo "2. Убедитесь, что база данных запущена"
echo "3. Запустите приложение: npm run start:dev"

