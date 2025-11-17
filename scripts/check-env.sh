#!/bin/bash

# Скрипт проверки окружения и зависимостей

set -e

ERRORS=0
WARNINGS=0

echo "🔍 Проверка окружения..."

# Проверка Node.js
echo -n "Node.js: "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "✅ $NODE_VERSION"
    
    # Проверка версии
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -lt 18 ]; then
        echo "   ⚠️  Требуется Node.js >= 18.0.0"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "❌ Не установлен"
    ERRORS=$((ERRORS + 1))
fi

# Проверка npm
echo -n "npm: "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "✅ $NPM_VERSION"
else
    echo "❌ Не установлен"
    ERRORS=$((ERRORS + 1))
fi

# Проверка Docker
echo -n "Docker: "
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker -v | cut -d' ' -f3 | cut -d',' -f1)
    echo "✅ $DOCKER_VERSION"
else
    echo "⚠️  Не установлен (опционально)"
    WARNINGS=$((WARNINGS + 1))
fi

# Проверка Docker Compose
echo -n "Docker Compose: "
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose -v | cut -d' ' -f3 | cut -d',' -f1)
    echo "✅ $COMPOSE_VERSION"
else
    echo "⚠️  Не установлен (опционально)"
    WARNINGS=$((WARNINGS + 1))
fi

# Проверка PostgreSQL клиента
echo -n "PostgreSQL клиент (psql): "
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version | cut -d' ' -f3)
    echo "✅ $PSQL_VERSION"
else
    echo "⚠️  Не установлен (опционально, нужен для бэкапов)"
    WARNINGS=$((WARNINGS + 1))
fi

# Проверка .env файла
echo -n ".env файл: "
if [ -f .env ]; then
    echo "✅ Найден"
    
    # Проверка обязательных переменных
    echo "   Проверка переменных окружения..."
    
    if grep -q "JWT_SECRET=" .env; then
        JWT_SECRET=$(grep "JWT_SECRET=" .env | cut -d'=' -f2)
        if [ ${#JWT_SECRET} -lt 32 ]; then
            echo "   ❌ JWT_SECRET слишком короткий (минимум 32 символа)"
            ERRORS=$((ERRORS + 1))
        else
            echo "   ✅ JWT_SECRET установлен"
        fi
    else
        echo "   ❌ JWT_SECRET не установлен"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "DATABASE_URL=" .env; then
        echo "   ✅ DATABASE_URL установлен"
    else
        echo "   ❌ DATABASE_URL не установлен"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo "❌ Не найден"
    echo "   Создайте .env файл из .env.example"
    ERRORS=$((ERRORS + 1))
fi

# Проверка node_modules
echo -n "Зависимости (node_modules): "
if [ -d "node_modules" ]; then
    echo "✅ Установлены"
else
    echo "❌ Не установлены"
    echo "   Запустите: npm install"
    ERRORS=$((ERRORS + 1))
fi

# Проверка Prisma
echo -n "Prisma клиент: "
if [ -d "node_modules/.prisma" ] || [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Сгенерирован"
else
    echo "⚠️  Не сгенерирован"
    echo "   Запустите: npm run prisma:generate"
    WARNINGS=$((WARNINGS + 1))
fi

# Итоги
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ Все проверки пройдены!"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  Есть предупреждения ($WARNINGS)"
    exit 0
else
    echo "❌ Найдено ошибок: $ERRORS, предупреждений: $WARNINGS"
    exit 1
fi

