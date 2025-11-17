#!/bin/bash
# Скрипт для генерации безопасного JWT_SECRET

echo "# Генерация JWT_SECRET..."
SECRET=$(openssl rand -base64 32 | tr -d '\n')
echo ""
echo "JWT_SECRET=$SECRET"
echo ""
echo "Скопируйте эту строку в ваш .env файл"
