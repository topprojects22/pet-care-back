# 🚀 ПОЭТАПНЫЙ ПЛАН ДЕПЛОЯ ДЛЯ ЧАЙНИКОВ - ЧАСТЬ 1

**Версия:** 1.0  
**Для:** Pet Care Backend API  
**Целевая аудитория:** Начинающие DevOps инженеры

---

## 📋 СОДЕРЖАНИЕ ЧАСТИ 1

1. [Подготовка сервера](#1-подготовка-сервера)
2. [Установка базового ПО](#2-установка-базового-по)
3. [Настройка базы данных PostgreSQL](#3-настройка-базы-данных-postgresql)
4. [Установка и настройка Nginx (реверс-прокси)](#4-установка-и-настройка-nginx-реверс-прокси)
5. [Настройка SSL сертификатов (HTTPS)](#5-настройка-ssl-сертификатов-https)
6. [Деплой приложения](#6-деплой-приложения)
7. [Конфигурация для нагрузок 10-1000 пользователей](#7-конфигурация-для-нагрузок-10-1000-пользователей)

---

## 1. ПОДГОТОВКА СЕРВЕРА

### 1.1 Выбор провайдера и сервера

#### Для 10-100 пользователей:
- **VPS:** DigitalOcean, Vultr, Hetzner
- **Конфигурация:** 1 CPU, 2GB RAM, 20GB SSD
- **Стоимость:** ~$6-12/месяц
- **Рекомендация:** DigitalOcean Droplet (Basic, $12/мес)

#### Для 100-1000 пользователей:
- **VPS:** DigitalOcean, AWS EC2, Google Cloud
- **Конфигурация:** 2 CPU, 4GB RAM, 40GB SSD
- **Стоимость:** ~$24-40/месяц
- **Рекомендация:** DigitalOcean Droplet (Regular, $24/мес)

#### Выбор операционной системы:
```bash
# Рекомендуется: Ubuntu 22.04 LTS
# Почему: стабильная, хорошо документирована, много примеров
```

### 1.2 Первоначальная настройка сервера

#### Шаг 1: Подключение к серверу

```bash
# Подключитесь к серверу по SSH
ssh root@YOUR_SERVER_IP

# Или если используете ключ:
ssh -i ~/.ssh/your_key.pem root@YOUR_SERVER_IP
```

#### Шаг 2: Обновление системы

```bash
# Обновляем список пакетов
apt update

# Обновляем все установленные пакеты
apt upgrade -y

# Перезагружаем сервер (если нужно)
reboot
```

#### Шаг 3: Создание пользователя (не root)

```bash
# Создаем нового пользователя
adduser deploy

# Добавляем пользователя в группу sudo
usermod -aG sudo deploy

# Переключаемся на нового пользователя
su - deploy
```

#### Шаг 4: Настройка SSH ключей

```bash
# На вашем локальном компьютере (НЕ на сервере!)
# Генерируем SSH ключ (если еще нет)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Копируем ключ на сервер
ssh-copy-id deploy@YOUR_SERVER_IP

# Теперь можно подключаться без пароля
ssh deploy@YOUR_SERVER_IP
```

#### Шаг 5: Настройка firewall (UFW)

```bash
# Устанавливаем UFW (если не установлен)
sudo apt install ufw -y

# Разрешаем SSH (ВАЖНО! Сделайте это первым!)
sudo ufw allow OpenSSH

# Разрешаем HTTP и HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Включаем firewall
sudo ufw enable

# Проверяем статус
sudo ufw status
```

**Ожидаемый вывод:**
```
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
OpenSSH (v6)               ALLOW       Anywhere (v6)
80/tcp (v6)                ALLOW       Anywhere (v6)
443/tcp (v6)               ALLOW       Anywhere (v6)
```

---

## 2. УСТАНОВКА БАЗОВОГО ПО

### 2.1 Установка Node.js 18.x

```bash
# Обновляем систему
sudo apt update

# Устанавливаем curl (если нет)
sudo apt install curl -y

# Добавляем официальный репозиторий NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Устанавливаем Node.js
sudo apt install -y nodejs

# Проверяем версию
node --version
# Должно быть: v18.x.x или выше

npm --version
# Должно быть: 9.x.x или выше
```

### 2.2 Установка PostgreSQL 14

```bash
# Устанавливаем PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Проверяем версию
psql --version
# Должно быть: PostgreSQL 14.x или выше

# Запускаем PostgreSQL (обычно уже запущен)
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Проверяем статус
sudo systemctl status postgresql
```

### 2.3 Установка PM2 (менеджер процессов)

```bash
# Устанавливаем PM2 глобально
sudo npm install -g pm2

# Проверяем установку
pm2 --version

# Настраиваем автозапуск PM2 при перезагрузке
pm2 startup

# Выполните команду, которую выведет PM2 (примерно такую):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

### 2.4 Установка Git

```bash
# Устанавливаем Git
sudo apt install git -y

# Проверяем версию
git --version

# Настраиваем Git (если нужно)
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

### 2.5 Установка Docker (опционально, для контейнеризации)

```bash
# Устанавливаем зависимости
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Добавляем официальный GPG ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавляем репозиторий Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Обновляем список пакетов
sudo apt update

# Устанавливаем Docker
sudo apt install docker-ce docker-ce-cli containerd.io -y

# Добавляем пользователя в группу docker
sudo usermod -aG docker deploy

# Проверяем установку
docker --version

# ВАЖНО: Выйдите и войдите снова, чтобы изменения вступили в силу
exit
# Затем снова подключитесь
ssh deploy@YOUR_SERVER_IP
```

---

## 3. НАСТРОЙКА БАЗЫ ДАННЫХ POSTGRESQL

### 3.1 Создание базы данных и пользователя

```bash
# Переключаемся на пользователя postgres
sudo -u postgres psql

# В консоли PostgreSQL выполняем:
```

```sql
-- Создаем пользователя для приложения
CREATE USER petcare_user WITH PASSWORD 'ВАШ_СИЛЬНЫЙ_ПАРОЛЬ_ЗДЕСЬ';

-- Создаем базу данных
CREATE DATABASE petcare_db OWNER petcare_user;

-- Даем все права пользователю на базу данных
GRANT ALL PRIVILEGES ON DATABASE petcare_db TO petcare_user;

-- Выходим из консоли PostgreSQL
\q
```

**⚠️ ВАЖНО:** Замените `ВАШ_СИЛЬНЫЙ_ПАРОЛЬ_ЗДЕСЬ` на надежный пароль (минимум 16 символов, буквы, цифры, символы).

### 3.2 Настройка PostgreSQL для production

```bash
# Редактируем конфигурационный файл PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**Найдите и измените следующие параметры:**

```conf
# Для 10-100 пользователей:
max_connections = 100
shared_buffers = 512MB
effective_cache_size = 1GB
maintenance_work_mem = 128MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5MB
min_wal_size = 1GB
max_wal_size = 4GB

# Для 100-1000 пользователей:
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 10MB
```

**Сохраните файл:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 3.3 Настройка доступа к PostgreSQL

```bash
# Редактируем файл pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

**Найдите строки в конце файла и убедитесь, что они выглядят так:**

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Сохраните и перезапустите PostgreSQL:**

```bash
sudo systemctl restart postgresql
sudo systemctl status postgresql
```

### 3.4 Тестирование подключения

```bash
# Проверяем подключение к базе данных
psql -U petcare_user -d petcare_db -h localhost

# Если подключение успешно, вы увидите:
# petcare_db=>

# Выходим
\q
```

---

## 4. УСТАНОВКА И НАСТРОЙКА NGINX (РЕВЕРС-ПРОКСИ)

### 4.1 Установка Nginx

```bash
# Устанавливаем Nginx
sudo apt install nginx -y

# Запускаем Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Проверяем статус
sudo systemctl status nginx
```

### 4.2 Выбор конфигурации Nginx по нагрузке

#### Для 10-100 пользователей:
- **Простая конфигурация:** один сервер, базовый прокси
- **Worker processes:** 2-4
- **Worker connections:** 512-1024

#### Для 100-1000 пользователей:
- **Оптимизированная конфигурация:** кэширование, сжатие
- **Worker processes:** 4-8 (по количеству CPU)
- **Worker connections:** 1024-2048

### 4.3 Настройка основной конфигурации Nginx

```bash
# Редактируем основной конфиг Nginx
sudo nano /etc/nginx/nginx.conf
```

**Замените содержимое на:**

```nginx
user www-data;
worker_processes auto;  # Автоматически определяет количество CPU
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    # Для 10-100 пользователей:
    worker_connections 1024;
    
    # Для 100-1000 пользователей:
    # worker_connections 2048;
    
    use epoll;  # Эффективный метод для Linux
    multi_accept on;  # Принимать несколько соединений одновременно
}

http {
    ##
    # Basic Settings
    ##
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;  # Скрываем версию Nginx (безопасность)
    
    # Размеры буферов
    client_body_buffer_size 128k;
    client_max_body_size 10m;  # Максимальный размер загружаемого файла
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;
    
    # Таймауты
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;
    
    ##
    # Gzip Settings (сжатие для экономии трафика)
    ##
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss 
               application/rss+xml font/truetype font/opentype 
               application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";
    
    ##
    # Logging Settings
    ##
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    ##
    # Virtual Host Configs
    ##
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.4 Создание конфигурации для приложения

```bash
# Создаем конфигурационный файл для нашего приложения
sudo nano /etc/nginx/sites-available/pet-care-api
```

**Вставьте следующую конфигурацию:**

```nginx
# Upstream для балансировки нагрузки (если будет несколько инстансов)
upstream pet_care_backend {
    # Для одного инстанса:
    server 127.0.0.1:5000;
    
    # Для нескольких инстансов (100-1000 пользователей):
    # server 127.0.0.1:5000 weight=1 max_fails=3 fail_timeout=30s;
    # server 127.0.0.1:5001 weight=1 max_fails=3 fail_timeout=30s;
    
    # Настройки keepalive для переиспользования соединений
    keepalive 32;
}

# HTTP сервер (перенаправляет на HTTPS)
server {
    listen 80;
    listen [::]:80;
    server_name api.yourdomain.com;  # ЗАМЕНИТЕ на ваш домен
    
    # Логи
    access_log /var/log/nginx/pet-care-api-access.log;
    error_log /var/log/nginx/pet-care-api-error.log;
    
    # Перенаправление на HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS сервер
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name api.yourdomain.com;  # ЗАМЕНИТЕ на ваш домен
    
    # SSL сертификаты (будем настраивать в следующем разделе)
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    
    # SSL настройки (современные и безопасные)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Другие заголовки безопасности
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Логи
    access_log /var/log/nginx/pet-care-api-ssl-access.log main;
    error_log /var/log/nginx/pet-care-api-ssl-error.log warn;
    
    # Максимальный размер загружаемого файла
    client_max_body_size 10M;
    
    # Проксирование на приложение
    location / {
        proxy_pass http://pet_care_backend;
        proxy_http_version 1.1;
        
        # Заголовки для проксирования
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Кэширование для статических файлов
        proxy_cache_bypass $http_upgrade;
        
        # Отключаем буферизацию для SSE (если будет использоваться)
        proxy_buffering off;
    }
    
    # Статические файлы (uploads) - отдаем напрямую через Nginx
    location /uploads/ {
        alias /home/deploy/pet-care-back/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Health check endpoint (без логирования)
    location /api/health {
        proxy_pass http://pet_care_backend;
        access_log off;
    }
}
```

**Сохраните файл**

### 4.5 Активация конфигурации

```bash
# Создаем символическую ссылку для активации сайта
sudo ln -s /etc/nginx/sites-available/pet-care-api /etc/nginx/sites-enabled/

# Удаляем дефолтный сайт (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию на ошибки
sudo nginx -t

# Если все ОК, перезагружаем Nginx
sudo systemctl reload nginx
```

**Ожидаемый вывод при проверке:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

## 5. НАСТРОЙКА SSL СЕРТИФИКАТОВ (HTTPS)

### 5.1 Установка Certbot (Let's Encrypt)

```bash
# Устанавливаем Certbot
sudo apt install certbot python3-certbot-nginx -y

# Проверяем установку
certbot --version
```

### 5.2 Получение SSL сертификата

**⚠️ ВАЖНО:** Перед получением сертификата убедитесь, что:
1. Домен указывает на IP вашего сервера (A-запись)
2. Nginx настроен и работает
3. Порты 80 и 443 открыты в firewall

```bash
# Получаем сертификат (интерактивный режим)
sudo certbot --nginx -d api.yourdomain.com

# Или автоматический режим (если знаете email):
sudo certbot --nginx -d api.yourdomain.com --email your_email@example.com --agree-tos --non-interactive
```

**Certbot задаст вопросы:**
1. Email для уведомлений о истечении сертификата
2. Согласие с условиями использования
3. Подписка на новости (можно отказаться)

**Certbot автоматически:**
- Получит сертификат
- Настроит Nginx для использования HTTPS
- Настроит автоматическое обновление

### 5.3 Проверка автоматического обновления

```bash
# Проверяем, что автообновление настроено
sudo certbot renew --dry-run

# Проверяем статус сертификата
sudo certbot certificates
```

**Ожидаемый вывод:**
```
Found the following certs:
  Certificate Name: api.yourdomain.com
    Domains: api.yourdomain.com
    Expiry Date: 2024-XX-XX XX:XX:XX+00:00 (VALID: XX days)
    Certificate Path: /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/api.yourdomain.com/privkey.pem
```

### 5.4 Настройка cron для автоматического обновления

```bash
# Проверяем, что cron job создан
sudo systemctl status certbot.timer

# Если не активен, активируем
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 6. ДЕПЛОЙ ПРИЛОЖЕНИЯ

### 6.1 Подготовка директории для приложения

```bash
# Создаем директорию для приложения
mkdir -p ~/pet-care-back
cd ~/pet-care-back

# Создаем директорию для uploads
mkdir -p uploads
```

### 6.2 Клонирование репозитория

```bash
# Клонируем репозиторий (замените на ваш URL)
git clone https://github.com/your-username/pet-care-back.git .

# Или если используете SSH:
# git clone git@github.com:your-username/pet-care-back.git .
```

### 6.3 Настройка переменных окружения

```bash
# Создаем файл .env
nano .env
```

**Вставьте следующую конфигурацию:**

```env
# Окружение
NODE_ENV=production
PORT=5000

# База данных
DATABASE_URL=postgresql://petcare_user:ВАШ_ПАРОЛЬ@localhost:5432/petcare_db

# JWT
JWT_SECRET=ВАШ_ОЧЕНЬ_ДЛИННЫЙ_СЛУЧАЙНЫЙ_СЕКРЕТ_МИНИМУМ_32_СИМВОЛА
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Приложение
APP_URL=https://api.yourdomain.com
APP_API_PREFIX=api

# CORS (укажите домены вашего фронтенда)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Email (для отправки писем)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com

# Redis (опционально, для кэширования)
REDIS_HOST=localhost
REDIS_PORT=6379
USE_REDIS=false

# Логирование
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true

# Метрики
METRICS_ENABLED=true
METRICS_PORT=9090

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

**⚠️ ВАЖНО:** 
- Замените `ВАШ_ПАРОЛЬ` на пароль из раздела 3.1
- Сгенерируйте `JWT_SECRET` (можно использовать: `openssl rand -base64 32`)
- Укажите правильные домены

**Сохраните файл:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 6.4 Установка зависимостей и сборка

```bash
# Устанавливаем зависимости
npm ci --only=production

# Генерируем Prisma Client
npx prisma generate

# Применяем миграции базы данных
npx prisma migrate deploy

# Собираем приложение
npm run build
```

### 6.5 Запуск приложения с PM2

```bash
# Создаем файл конфигурации PM2
nano ecosystem.config.js
```

**Вставьте следующую конфигурацию:**

```javascript
module.exports = {
  apps: [{
    name: 'pet-care-api',
    script: './dist/main.js',
    instances: 1,  // Для 10-100 пользователей: 1
                   // Для 100-1000 пользователей: 'max' (по количеству CPU)
    exec_mode: 'cluster',  // Используем cluster mode для масштабирования
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Логирование
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Автоперезапуск
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',  // Перезапуск при превышении памяти
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Health check
    health_check_grace_period: 3000
  }]
};
```

**Сохраните и запустите:**

```bash
# Создаем директорию для логов
mkdir -p logs

# Запускаем приложение
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2
pm2 save

# Проверяем статус
pm2 status

# Смотрим логи
pm2 logs pet-care-api
```

**Ожидаемый вывод `pm2 status`:**
```
┌─────┬─────────────────┬─────────┬─────────┬──────────┬─────────┐
│ id  │ name            │ mode    │ ↺       │ status   │ cpu     │
├─────┼─────────────────┼─────────┼─────────┼──────────┼─────────┤
│ 0   │ pet-care-api    │ cluster │ 0       │ online   │ 0%      │
└─────┴─────────────────┴─────────┴─────────┴──────────┴─────────┘
```

### 6.6 Проверка работы приложения

```bash
# Проверяем, что приложение отвечает
curl http://localhost:5000/api/health

# Должен вернуться JSON с информацией о здоровье приложения
```

---

## 7. КОНФИГУРАЦИЯ ДЛЯ НАГРУЗОК 10-1000 ПОЛЬЗОВАТЕЛЕЙ

### 7.1 Конфигурация для 10 пользователей

**Характеристики:**
- Одновременных запросов: ~5-10
- Трафик: ~1-5 GB/месяц
- Пиковая нагрузка: минимальная

**Конфигурация сервера:**
```bash
# Минимальные требования:
# - 1 CPU
# - 1GB RAM
# - 20GB SSD
```

**Nginx конфигурация:**
```nginx
worker_processes 2;
worker_connections 512;
```

**PM2 конфигурация:**
```javascript
instances: 1,  // Один инстанс достаточно
max_memory_restart: '300M'
```

**PostgreSQL:**
```conf
max_connections = 50
shared_buffers = 256MB
```

### 7.2 Конфигурация для 100 пользователей

**Характеристики:**
- Одновременных запросов: ~20-50
- Трафик: ~10-50 GB/месяц
- Пиковая нагрузка: умеренная

**Конфигурация сервера:**
```bash
# Рекомендуемые требования:
# - 1-2 CPU
# - 2GB RAM
# - 40GB SSD
```

**Nginx конфигурация:**
```nginx
worker_processes 2;
worker_connections 1024;
```

**PM2 конфигурация:**
```javascript
instances: 1,  // Можно оставить один
max_memory_restart: '500M'
```

**PostgreSQL:**
```conf
max_connections = 100
shared_buffers = 512MB
effective_cache_size = 1GB
```

### 7.3 Конфигурация для 1000 пользователей

**Характеристики:**
- Одновременных запросов: ~100-300
- Трафик: ~100-500 GB/месяц
- Пиковая нагрузка: высокая

**Конфигурация сервера:**
```bash
# Рекомендуемые требования:
# - 2-4 CPU
# - 4GB RAM
# - 80GB SSD
```

**Nginx конфигурация:**
```nginx
worker_processes auto;  # По количеству CPU
worker_connections 2048;
```

**PM2 конфигурация:**
```javascript
instances: 'max',  // По количеству CPU ядер
max_memory_restart: '1G'
```

**PostgreSQL:**
```conf
max_connections = 200
shared_buffers = 1GB
effective_cache_size = 3GB
work_mem = 10MB
```

**Дополнительные настройки:**

1. **Включить Redis для кэширования:**
```bash
# Устанавливаем Redis
sudo apt install redis-server -y

# Настраиваем Redis
sudo nano /etc/redis/redis.conf
```

Найдите и измените:
```conf
maxmemory 256mb
maxmemory-policy allkeys-lru
```

```bash
# Перезапускаем Redis
sudo systemctl restart redis-server

# В .env файле:
USE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

2. **Оптимизация Nginx для кэширования:**
```nginx
# Добавьте в http блок nginx.conf:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m 
                 inactive=60m use_temp_path=off;

# В server блок добавьте:
location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 60m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    proxy_cache_background_update on;
    proxy_cache_lock on;
    
    proxy_pass http://pet_care_backend;
    # ... остальные proxy настройки
}
```

---

## 📊 ТАБЛИЦА СВОДКИ КОНФИГУРАЦИЙ

| Параметр | 10 пользователей | 100 пользователей | 1000 пользователей |
|----------|------------------|-------------------|---------------------|
| **Сервер** |
| CPU | 1 | 1-2 | 2-4 |
| RAM | 1GB | 2GB | 4GB |
| SSD | 20GB | 40GB | 80GB |
| Стоимость/мес | $6-12 | $12-24 | $24-40 |
| **Nginx** |
| Worker processes | 2 | 2 | auto |
| Worker connections | 512 | 1024 | 2048 |
| **PM2** |
| Instances | 1 | 1 | max |
| Memory limit | 300M | 500M | 1G |
| **PostgreSQL** |
| Max connections | 50 | 100 | 200 |
| Shared buffers | 256MB | 512MB | 1GB |
| **Redis** | Не требуется | Опционально | Рекомендуется |

---

## ✅ ПРОВЕРКА РАБОТОСПОСОБНОСТИ

### Финальная проверка всех компонентов:

```bash
# 1. Проверка PostgreSQL
sudo systemctl status postgresql
psql -U petcare_user -d petcare_db -h localhost -c "SELECT version();"

# 2. Проверка Nginx
sudo systemctl status nginx
sudo nginx -t
curl -I http://localhost

# 3. Проверка PM2
pm2 status
pm2 logs pet-care-api --lines 50

# 4. Проверка SSL
sudo certbot certificates
curl -I https://api.yourdomain.com

# 5. Проверка приложения
curl https://api.yourdomain.com/api/health
```

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ ДЛЯ УПРАВЛЕНИЯ

```bash
# PM2
pm2 restart pet-care-api      # Перезапуск приложения
pm2 stop pet-care-api         # Остановка
pm2 delete pet-care-api       # Удаление из PM2
pm2 monit                     # Мониторинг в реальном времени
pm2 logs pet-care-api         # Просмотр логов

# Nginx
sudo nginx -t                 # Проверка конфигурации
sudo systemctl reload nginx   # Перезагрузка без простоя
sudo systemctl restart nginx  # Полный перезапуск

# PostgreSQL
sudo systemctl status postgresql
sudo systemctl restart postgresql
psql -U petcare_user -d petcare_db -h localhost

# SSL
sudo certbot renew            # Обновление сертификатов
sudo certbot certificates     # Список сертификатов
```

---

## 🚨 ЧАСТЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### Проблема 1: Приложение не запускается

```bash
# Проверьте логи
pm2 logs pet-care-api --err

# Проверьте переменные окружения
pm2 env 0

# Проверьте подключение к БД
psql -U petcare_user -d petcare_db -h localhost
```

### Проблема 2: Nginx возвращает 502 Bad Gateway

```bash
# Проверьте, что приложение запущено
pm2 status

# Проверьте, что приложение слушает порт 5000
sudo netstat -tlnp | grep 5000

# Проверьте логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### Проблема 3: SSL сертификат не работает

```bash
# Проверьте, что домен указывает на сервер
dig api.yourdomain.com

# Проверьте статус сертификата
sudo certbot certificates

# Попробуйте получить сертификат заново
sudo certbot --nginx -d api.yourdomain.com --force-renewal
```

---

## 📝 ЧЕКЛИСТ ПЕРЕД ЗАПУСКОМ В PRODUCTION

- [ ] Все пароли изменены на сильные
- [ ] JWT_SECRET сгенерирован и сохранен безопасно
- [ ] SSL сертификат установлен и работает
- [ ] Firewall настроен (открыты только нужные порты)
- [ ] База данных настроена и протестирована
- [ ] PM2 настроен на автозапуск
- [ ] Логирование работает
- [ ] Health checks отвечают
- [ ] Резервное копирование настроено
- [ ] Мониторинг настроен (опционально)

---

**Следующая часть:** Масштабирование для 10,000+ пользователей, мониторинг, load balancing, и продвинутые оптимизации.

