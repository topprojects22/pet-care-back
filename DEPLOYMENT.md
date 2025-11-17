# Руководство по развертыванию

## 🐳 Docker развертывание

### Быстрый старт

```bash
# Запуск с docker-compose (включает PostgreSQL)
docker-compose up -d

# Просмотр логов
docker-compose logs -f app

# Остановка
docker-compose down
```

### Ручная сборка Docker образа

```bash
# Сборка образа
docker build -t pet-care-backend .

# Запуск контейнера
docker run -d \
  --name petcare-app \
  -p 5000:5000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your-secret-key \
  -v $(pwd)/uploads:/app/uploads \
  pet-care-backend
```

## ☁️ Production развертывание

### Требования

- Node.js 18+
- PostgreSQL 14+
- Минимум 512MB RAM
- Минимум 1GB дискового пространства

### Шаги развертывания

1. **Клонирование репозитория**

```bash
git clone <repository-url>
cd pet-care-back
```

2. **Установка зависимостей**

```bash
npm ci --only=production
```

3. **Настройка переменных окружения**

```bash
cp .env.example .env
# Отредактируйте .env с production значениями
```

4. **Настройка базы данных**

```bash
# Генерация Prisma Client
npx prisma generate

# Применение миграций
npx prisma migrate deploy
```

5. **Сборка приложения**

```bash
npm run build
```

6. **Запуск приложения**

```bash
# С PM2 (рекомендуется)
npm install -g pm2
pm2 start dist/main.js --name pet-care-api

# Или напрямую
NODE_ENV=production node dist/main.js
```

### PM2 конфигурация

Создайте файл `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'pet-care-api',
    script: './dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
```

Запуск:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔄 CI/CD с GitHub Actions

Проект включает готовую конфигурацию CI/CD в `.github/workflows/ci.yml`.

### Что делает CI:

1. Запускает тесты на каждом push/PR
2. Проверяет линтер
3. Собирает приложение
4. Проверяет наличие артефактов сборки

### Настройка автоматического деплоя

Добавьте секреты в GitHub:
- `DEPLOY_HOST` - IP адрес сервера
- `DEPLOY_USER` - пользователь для SSH
- `DEPLOY_KEY` - приватный SSH ключ

## 📊 Мониторинг

### Health Checks

Приложение предоставляет endpoints для мониторинга:

- `GET /api/health` - Полная проверка состояния
- `GET /api/health/liveness` - Liveness probe
- `GET /api/health/readiness` - Readiness probe

### Логирование

Логи доступны через:
- PM2: `pm2 logs pet-care-api`
- Docker: `docker-compose logs -f app`
- Файлы: `./logs/` (если настроено)

## 🔒 Безопасность в production

1. **Измените JWT_SECRET** - Используйте длинный случайный ключ
2. **Настройте CORS** - Укажите только разрешенные домены
3. **Включите HTTPS** - Используйте reverse proxy (nginx)
4. **Ограничьте rate limiting** - Настройте под вашу нагрузку
5. **Регулярно обновляйте зависимости** - `npm audit fix`

## 🌐 Nginx конфигурация

Пример конфигурации для reverse proxy:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📈 Масштабирование

### Горизонтальное масштабирование

1. Запустите несколько инстансов приложения
2. Используйте load balancer (nginx, HAProxy)
3. Настройте shared session storage (Redis)

### Вертикальное масштабирование

1. Увеличьте ресурсы сервера
2. Настройте connection pooling в Prisma
3. Добавьте Redis для кэширования

## 🔧 Резервное копирование

### База данных

```bash
# Создание бэкапа
pg_dump -U postgres petcare > backup_$(date +%Y%m%d).sql

# Восстановление
psql -U postgres petcare < backup_20240101.sql
```

### Автоматическое резервное копирование

Настройте cron job:
```bash
0 2 * * * pg_dump -U postgres petcare > /backups/petcare_$(date +\%Y\%m\%d).sql
```

## 🚨 Troubleshooting

### Приложение не запускается

1. Проверьте переменные окружения
2. Убедитесь, что база данных доступна
3. Проверьте логи: `pm2 logs` или `docker-compose logs`

### Ошибки подключения к БД

1. Проверьте `DATABASE_URL`
2. Убедитесь, что PostgreSQL запущен
3. Проверьте firewall правила

### Высокая нагрузка

1. Включите кэширование (Redis)
2. Оптимизируйте запросы к БД
3. Добавьте индексы (см. PRISMA_INDEXES.md)
4. Настройте rate limiting

---

Для дополнительной информации см. [QUICK_START.md](./QUICK_START.md) и [README.md](./README.md)

