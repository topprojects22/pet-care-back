#!/bin/bash

# Скрипт для мониторинга логов приложения

set -e

LOG_TYPE=${1:-all} # all, app, error, docker

echo "📋 Мониторинг логов (тип: $LOG_TYPE)..."

case $LOG_TYPE in
  "app")
    if [ -d "logs" ]; then
      tail -f logs/application-*.log
    else
      echo "⚠️  Логи приложения не найдены. Убедитесь, что ENABLE_FILE_LOGGING=true в .env"
    fi
    ;;
  "error")
    if [ -d "logs" ]; then
      tail -f logs/error-*.log
    else
      echo "⚠️  Логи ошибок не найдены"
    fi
    ;;
  "docker")
    docker-compose logs -f app
    ;;
  "all"|*)
    # Показываем все логи
    if [ -d "logs" ]; then
      tail -f logs/*.log
    else
      docker-compose logs -f
    fi
    ;;
esac

