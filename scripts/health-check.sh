#!/bin/bash

# Скрипт проверки здоровья приложения

set -e

BASE_URL=${1:-http://localhost:5000}
API_PREFIX=${2:-api}

echo "🏥 Проверка здоровья приложения..."
echo "URL: $BASE_URL/$API_PREFIX"
echo ""

# Проверка health endpoint
echo -n "Health Check: "
if curl -f -s "$BASE_URL/$API_PREFIX/health" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
    exit 1
fi

# Проверка liveness
echo -n "Liveness: "
if curl -f -s "$BASE_URL/$API_PREFIX/health/liveness" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
    exit 1
fi

# Проверка readiness
echo -n "Readiness: "
if curl -f -s "$BASE_URL/$API_PREFIX/health/readiness" > /dev/null; then
    echo "✅ OK"
else
    echo "❌ FAILED"
    exit 1
fi

# Проверка метрик (если доступны)
echo -n "Metrics: "
if curl -f -s "$BASE_URL/metrics" > /dev/null 2>&1; then
    echo "✅ OK"
else
    echo "⚠️  Недоступны"
fi

echo ""
echo "✅ Все проверки пройдены!"

