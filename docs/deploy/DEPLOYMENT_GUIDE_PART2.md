# 🚀 ПОЭТАПНЫЙ ПЛАН ДЕПЛОЯ ДЛЯ ЧАЙНИКОВ - ЧАСТЬ 2

**Версия:** 1.0  
**Для:** Pet Care Backend API  
**Целевая аудитория:** Начинающие DevOps инженеры

---

## 📋 СОДЕРЖАНИЕ ЧАСТИ 2

1. [Масштабирование для 10,000+ пользователей](#1-масштабирование-для-10000-пользователей)
2. [Настройка Load Balancing](#2-настройка-load-balancing)
3. [Мониторинг и алертинг](#3-мониторинг-и-алертинг)
4. [Кэширование и оптимизация](#4-кэширование-и-оптимизация)
5. [Автомасштабирование](#5-автомасштабирование)
6. [Резервное копирование и Disaster Recovery](#6-резервное-копирование-и-disaster-recovery)
7. [Безопасность на уровне инфраструктуры](#7-безопасность-на-уровне-инфраструктуры)
8. [Конфигурации для 10,000 / 100,000 / 500,000 пользователей](#8-конфигурации-для-10000--100000--500000-пользователей)

---

## 1. МАСШТАБИРОВАНИЕ ДЛЯ 10,000+ ПОЛЬЗОВАТЕЛЕЙ

### 1.1 Архитектура для высоких нагрузок

При нагрузке 10,000+ пользователей требуется распределенная архитектура:

```
                    ┌─────────────┐
                    │   CloudFlare │
                    │  (CDN + DDoS) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Load Balancer │
                    │   (Nginx/HAProxy) │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐      ┌─────▼─────┐
   │ App 1    │      │ App 2      │      │ App 3     │
   │ (Node.js)│      │ (Node.js)  │      │ (Node.js) │
   └────┬─────┘      └─────┬─────┘      └─────┬─────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌─────▼─────┐      ┌─────▼─────┐
   │ Redis   │      │ PostgreSQL │      │ Redis     │
   │ (Cache) │      │ (Primary)  │      │ (Session) │
   └─────────┘      └─────┬─────┘      └───────────┘
                          │
                    ┌─────▼─────┐
                    │ PostgreSQL │
                    │ (Replica)  │
                    └────────────┘
```

### 1.2 Выбор инфраструктуры

#### Для 10,000 пользователей:
- **Архитектура:** 2-3 сервера приложений + 1 БД сервер
- **Серверы приложений:** 4 CPU, 8GB RAM каждый
- **Сервер БД:** 4 CPU, 16GB RAM, SSD
- **Redis:** 2GB RAM
- **Стоимость:** ~$150-200/месяц

#### Для 100,000 пользователей:
- **Архитектура:** 5-10 серверов приложений + 2 БД (primary/replica)
- **Серверы приложений:** 8 CPU, 16GB RAM каждый
- **Сервер БД Primary:** 8 CPU, 32GB RAM, NVMe SSD
- **Сервер БД Replica:** 8 CPU, 32GB RAM, NVMe SSD
- **Redis Cluster:** 3 узла по 4GB RAM
- **Load Balancer:** отдельный сервер или managed service
- **Стоимость:** ~$800-1200/месяц

#### Для 500,000 пользователей:
- **Архитектура:** Kubernetes кластер или managed services
- **Рекомендация:** AWS EKS, Google GKE, или DigitalOcean Kubernetes
- **Серверы:** Auto-scaling группа 10-50 инстансов
- **БД:** Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- **Кэш:** Managed Redis (AWS ElastiCache, Redis Cloud)
- **CDN:** CloudFlare или AWS CloudFront
- **Стоимость:** ~$3000-5000/месяц

---

## 2. НАСТРОЙКА LOAD BALANCING

### 2.1 Установка и настройка HAProxy (альтернатива Nginx)

HAProxy лучше подходит для высоких нагрузок:

```bash
# Устанавливаем HAProxy
sudo apt install haproxy -y

# Проверяем версию
haproxy -v
```

### 2.2 Конфигурация HAProxy для Load Balancing

```bash
# Редактируем конфигурацию HAProxy
sudo nano /etc/haproxy/haproxy.cfg
```

**Полная конфигурация:**

```haproxy
global
    log /dev/log    local0
    log /dev/log    local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon
    maxconn 4096
    tune.ssl.default-dh-param 2048

defaults
    log     global
    mode    http
    option  httplog
    option  dontlognull
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 408 /etc/haproxy/errors/408.http
    errorfile 500 /etc/haproxy/errors/500.http
    errorfile 502 /etc/haproxy/errors/502.http
    errorfile 503 /etc/haproxy/errors/503.http
    errorfile 504 /etc/haproxy/errors/504.http

# Frontend - принимает входящие соединения
frontend http_front
    bind *:80
    redirect scheme https code 301 if !{ ssl_fc }

frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/api.yourdomain.com.pem
    
    # HSTS
    http-response set-header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # ACL для health checks
    acl is_health_check path_beg /api/health
    
    # Health check без логирования
    http-request set-log-level silent if is_health_check
    
    # Перенаправление на backend
    default_backend pet_care_backend

# Backend - балансировка между серверами приложений
backend pet_care_backend
    balance roundrobin  # Алгоритм балансировки
    # Можно использовать: roundrobin, leastconn, source
    
    # Health check для каждого сервера
    option httpchk GET /api/health
    
    # Настройки keepalive
    option http-keep-alive
    http-request set-header X-Forwarded-Proto https if { ssl_fc }
    
    # Серверы приложений
    # Для 10,000 пользователей: 2-3 сервера
    server app1 10.0.1.10:5000 check inter 5s fall 3 rise 2
    server app2 10.0.1.11:5000 check inter 5s fall 3 rise 2
    server app3 10.0.1.12:5000 check inter 5s fall 3 rise 2
    
    # Для 100,000+ пользователей добавьте больше серверов:
    # server app4 10.0.1.13:5000 check inter 5s fall 3 rise 2
    # server app5 10.0.1.14:5000 check inter 5s fall 3 rise 2
    
    # Настройки для sticky sessions (если нужно)
    # cookie SERVERID insert indirect nocache

# Статистика HAProxy (опционально, для мониторинга)
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats admin if TRUE
    stats auth admin:ВАШ_ПАРОЛЬ_ДЛЯ_СТАТИСТИКИ
```

**Сохраните и проверьте конфигурацию:**

```bash
# Проверяем конфигурацию
sudo haproxy -c -f /etc/haproxy/haproxy.cfg

# Если все ОК, перезапускаем HAProxy
sudo systemctl restart haproxy
sudo systemctl enable haproxy

# Проверяем статус
sudo systemctl status haproxy
```

### 2.3 Настройка Nginx как Load Balancer (альтернатива)

Если предпочитаете Nginx:

```bash
# Редактируем конфигурацию
sudo nano /etc/nginx/sites-available/pet-care-api
```

**Обновленная конфигурация с балансировкой:**

```nginx
# Upstream с несколькими серверами
upstream pet_care_backend {
    # Алгоритм балансировки
    least_conn;  # Отправляет запрос на сервер с наименьшим количеством соединений
    # Альтернативы: ip_hash (для sticky sessions), round_robin (по умолчанию)
    
    # Серверы приложений
    server 10.0.1.10:5000 max_fails=3 fail_timeout=30s weight=1;
    server 10.0.1.11:5000 max_fails=3 fail_timeout=30s weight=1;
    server 10.0.1.12:5000 max_fails=3 fail_timeout=30s weight=1;
    
    # Резервный сервер (если все основные недоступны)
    # server 10.0.1.13:5000 backup;
    
    # Keepalive соединения
    keepalive 64;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    # ... SSL настройки из части 1 ...
    
    location / {
        proxy_pass http://pet_care_backend;
        proxy_http_version 1.1;
        
        # Keepalive для upstream
        proxy_set_header Connection "";
        
        # Заголовки
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Буферизация
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
}
```

### 2.4 Настройка Sticky Sessions (если требуется)

Если приложение использует сессии:

```nginx
# В upstream блоке:
upstream pet_care_backend {
    ip_hash;  # Балансировка по IP (один IP всегда идет на один сервер)
    
    server 10.0.1.10:5000;
    server 10.0.1.11:5000;
    server 10.0.1.12:5000;
}
```

**Или через cookies:**

```nginx
upstream pet_care_backend {
    least_conn;
    
    server 10.0.1.10:5000;
    server 10.0.1.11:5000;
    server 10.0.1.12:5000;
}

# В location блоке:
location / {
    # Устанавливаем cookie для sticky session
    set $backend "pet_care_backend";
    if ($cookie_BACKEND) {
        set $backend $cookie_BACKEND;
    }
    
    proxy_pass http://$backend;
    # ... остальные настройки
}
```

---

## 3. МОНИТОРИНГ И АЛЕРТИНГ

### 3.1 Установка Prometheus

```bash
# Создаем пользователя для Prometheus
sudo useradd --no-create-home --shell /bin/false prometheus

# Создаем директории
sudo mkdir /etc/prometheus
sudo mkdir /var/lib/prometheus
sudo chown prometheus:prometheus /etc/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus

# Скачиваем Prometheus
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.45.0/prometheus-2.45.0.linux-amd64.tar.gz

# Распаковываем
tar xvf prometheus-2.45.0.linux-amd64.tar.gz
cd prometheus-2.45.0.linux-amd64/

# Копируем файлы
sudo cp prometheus promtool /usr/local/bin/
sudo cp -r consoles/ console_libraries/ /etc/prometheus/
sudo chown -R prometheus:prometheus /etc/prometheus
sudo chown prometheus:prometheus /usr/local/bin/prometheus
sudo chown prometheus:prometheus /usr/local/bin/promtool
```

### 3.2 Конфигурация Prometheus

```bash
# Создаем конфигурационный файл
sudo nano /etc/prometheus/prometheus.yml
```

**Конфигурация:**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'pet-care-monitor'

# Правила алертов
rule_files:
  - "alerts.yml"

# Конфигурация scraping (сбор метрик)
scrape_configs:
  # Метрики самого Prometheus
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Метрики приложения Pet Care
  - job_name: 'pet-care-api'
    metrics_path: '/api/metrics'
    scheme: 'http'
    static_configs:
      - targets:
        - '10.0.1.10:9090'
        - '10.0.1.11:9090'
        - '10.0.1.12:9090'
        labels:
          service: 'pet-care-api'
          environment: 'production'

  # Метрики Node.js (если используете node_exporter)
  - job_name: 'node'
    static_configs:
      - targets:
        - '10.0.1.10:9100'
        - '10.0.1.11:9100'
        - '10.0.1.12:9100'

  # Метрики PostgreSQL (если используете postgres_exporter)
  - job_name: 'postgres'
    static_configs:
      - targets: ['10.0.2.10:9187']
        labels:
          database: 'petcare_db'

  # Метрики Redis (если используете redis_exporter)
  - job_name: 'redis'
    static_configs:
      - targets: ['10.0.3.10:9121']
```

**Создаем файл алертов:**

```bash
sudo nano /etc/prometheus/alerts.yml
```

```yaml
groups:
  - name: pet_care_alerts
    interval: 30s
    rules:
      # Алерт: высокая загрузка CPU
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is above 80% for more than 5 minutes"

      # Алерт: высокая загрузка памяти
      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is above 85% for more than 5 minutes"

      # Алерт: приложение недоступно
      - alert: ApplicationDown
        expr: up{job="pet-care-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Pet Care API is down"
          description: "Application instance {{ $labels.instance }} is down"

      # Алерт: высокая латентность
      - alert: HighLatency
        expr: http_request_duration_seconds{quantile="0.95"} > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "95th percentile latency is above 1 second"

      # Алерт: много ошибок
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate"
          description: "Error rate is above 5% for more than 5 minutes"

      # Алерт: проблемы с БД
      - alert: DatabaseConnectionIssues
        expr: pg_stat_database_numbackends{datname="petcare_db"} > 150
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
          description: "Number of database connections is above 150"
```

**Создаем systemd service для Prometheus:**

```bash
sudo nano /etc/systemd/system/prometheus.service
```

```ini
[Unit]
Description=Prometheus Monitoring System
After=network.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries \
    --web.listen-address=0.0.0.0:9090 \
    --web.enable-lifecycle
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Запускаем Prometheus
sudo systemctl daemon-reload
sudo systemctl start prometheus
sudo systemctl enable prometheus
sudo systemctl status prometheus
```

### 3.3 Установка Grafana для визуализации

```bash
# Устанавливаем зависимости
sudo apt install -y software-properties-common

# Добавляем репозиторий Grafana
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add -

# Устанавливаем Grafana
sudo apt update
sudo apt install grafana -y

# Запускаем Grafana
sudo systemctl start grafana-server
sudo systemctl enable grafana-server
sudo systemctl status grafana-server
```

**Настройка Grafana:**

1. Откройте в браузере: `http://YOUR_SERVER_IP:3000`
2. Логин по умолчанию: `admin` / `admin`
3. Добавьте Prometheus как источник данных:
   - Settings → Data Sources → Add data source
   - Выберите Prometheus
   - URL: `http://localhost:9090`
   - Save & Test

### 3.4 Установка Node Exporter (метрики сервера)

```bash
# Скачиваем Node Exporter
cd /tmp
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz

# Распаковываем
tar xvf node_exporter-1.6.1.linux-amd64.tar.gz
cd node_exporter-1.6.1.linux-amd64/

# Копируем бинарник
sudo cp node_exporter /usr/local/bin/
sudo chown root:root /usr/local/bin/node_exporter

# Создаем systemd service
sudo nano /etc/systemd/system/node_exporter.service
```

```ini
[Unit]
Description=Node Exporter
After=network.target

[Service]
User=nobody
Group=nogroup
Type=simple
ExecStart=/usr/local/bin/node_exporter
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Запускаем Node Exporter
sudo systemctl daemon-reload
sudo systemctl start node_exporter
sudo systemctl enable node_exporter
sudo systemctl status node_exporter
```

### 3.5 Настройка алертов (Alertmanager)

```bash
# Скачиваем Alertmanager
cd /tmp
wget https://github.com/prometheus/alertmanager/releases/download/v0.26.0/alertmanager-0.26.0.linux-amd64.tar.gz

# Распаковываем
tar xvf alertmanager-0.26.0.linux-amd64.tar.gz
cd alertmanager-0.26.0.linux-amd64/

# Копируем файлы
sudo cp alertmanager amtool /usr/local/bin/
sudo mkdir /etc/alertmanager
sudo cp alertmanager.yml /etc/alertmanager/
sudo chown -R root:root /etc/alertmanager
```

**Конфигурация Alertmanager:**

```bash
sudo nano /etc/alertmanager/alertmanager.yml
```

```yaml
global:
  resolve_timeout: 5m
  # Настройки для отправки email
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@yourdomain.com'
  smtp_auth_username: 'your_email@gmail.com'
  smtp_auth_password: 'your_app_password'

# Маршрутизация алертов
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'email-notifications'
  
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

# Получатели алертов
receivers:
  - name: 'email-notifications'
    email_configs:
      - to: 'admin@yourdomain.com'
        headers:
          Subject: 'Pet Care Alert: {{ .GroupLabels.alertname }}'
        html: |
          <h2>Alert Details</h2>
          <p><strong>Alert:</strong> {{ .GroupLabels.alertname }}</p>
          <p><strong>Severity:</strong> {{ .GroupLabels.severity }}</p>
          <p><strong>Instance:</strong> {{ .GroupLabels.instance }}</p>
          <h3>Alerts:</h3>
          {{ range .Alerts }}
          <p><strong>Summary:</strong> {{ .Annotations.summary }}</p>
          <p><strong>Description:</strong> {{ .Annotations.description }}</p>
          <hr>
          {{ end }}

  - name: 'critical-alerts'
    email_configs:
      - to: 'admin@yourdomain.com'
        send_resolved: true
    # Можно добавить Slack, Telegram, PagerDuty и т.д.

  - name: 'warning-alerts'
    email_configs:
      - to: 'team@yourdomain.com'
```

**Создаем systemd service:**

```bash
sudo nano /etc/systemd/system/alertmanager.service
```

```ini
[Unit]
Description=Alertmanager
After=network.target

[Service]
User=root
Group=root
Type=simple
ExecStart=/usr/local/bin/alertmanager \
    --config.file=/etc/alertmanager/alertmanager.yml \
    --storage.path=/var/lib/alertmanager/
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Запускаем Alertmanager
sudo systemctl daemon-reload
sudo systemctl start alertmanager
sudo systemctl enable alertmanager
```

---

## 4. КЭШИРОВАНИЕ И ОПТИМИЗАЦИЯ

### 4.1 Установка и настройка Redis

```bash
# Устанавливаем Redis
sudo apt install redis-server -y

# Редактируем конфигурацию
sudo nano /etc/redis/redis.conf
```

**Ключевые настройки:**

```conf
# Для 10,000 пользователей:
maxmemory 512mb
maxmemory-policy allkeys-lru

# Для 100,000+ пользователей:
maxmemory 2gb
maxmemory-policy allkeys-lru

# Персистентность (опционально)
save 900 1
save 300 10
save 60 10000

# Защита паролем (ВАЖНО для production!)
requirepass ВАШ_СИЛЬНЫЙ_ПАРОЛЬ_REDIS

# Привязка к localhost (для безопасности)
bind 127.0.0.1 ::1
```

```bash
# Перезапускаем Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Проверяем работу
redis-cli ping
# Должно вернуть: PONG
```

### 4.2 Настройка Redis Sentinel (для высокой доступности)

Для 100,000+ пользователей рекомендуется Redis Sentinel:

```bash
# На каждом сервере Redis создаем конфигурацию Sentinel
sudo nano /etc/redis/sentinel.conf
```

```conf
port 26379

sentinel monitor petcare-redis 10.0.3.10 6379 2
sentinel down-after-milliseconds petcare-redis 5000
sentinel failover-timeout petcare-redis 10000
sentinel parallel-syncs petcare-redis 1

# Пароль (должен совпадать с Redis)
sentinel auth-pass petcare-redis ВАШ_ПАРОЛЬ_REDIS
```

### 4.3 Настройка кэширования в Nginx

```bash
sudo nano /etc/nginx/nginx.conf
```

**Добавьте в http блок:**

```nginx
# Кэш для API ответов
proxy_cache_path /var/cache/nginx/api_cache 
    levels=1:2 
    keys_zone=api_cache:100m 
    max_size=1g 
    inactive=60m 
    use_temp_path=off;

# Кэш для статических файлов
proxy_cache_path /var/cache/nginx/static_cache 
    levels=1:2 
    keys_zone=static_cache:50m 
    max_size=500m 
    inactive=7d 
    use_temp_path=off;
```

**В конфигурации сайта:**

```nginx
server {
    # ... остальные настройки ...
    
    # Кэширование API ответов (GET запросы)
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 60m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        proxy_cache_background_update on;
        proxy_cache_lock on;
        
        # Добавляем заголовок с информацией о кэше
        add_header X-Cache-Status $upstream_cache_status;
        
        # Не кэшируем POST, PUT, DELETE
        proxy_cache_methods GET HEAD;
        
        proxy_pass http://pet_care_backend;
        # ... остальные proxy настройки ...
    }
    
    # Кэширование статических файлов
    location /uploads/ {
        proxy_cache static_cache;
        proxy_cache_valid 200 7d;
        proxy_cache_valid 404 1h;
        proxy_ignore_headers Cache-Control;
        proxy_hide_header Cache-Control;
        add_header Cache-Control "public, max-age=604800";
        add_header X-Cache-Status $upstream_cache_status;
        
        proxy_pass http://pet_care_backend;
    }
}
```

**Создаем директорию для кэша:**

```bash
sudo mkdir -p /var/cache/nginx/api_cache /var/cache/nginx/static_cache
sudo chown -R www-data:www-data /var/cache/nginx
```

### 4.4 Оптимизация PostgreSQL для высоких нагрузок

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

**Для 10,000 пользователей:**

```conf
# Соединения
max_connections = 200

# Память
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
work_mem = 20MB

# WAL (Write-Ahead Logging)
wal_buffers = 16MB
checkpoint_completion_target = 0.9
min_wal_size = 2GB
max_wal_size = 8GB

# Запросы
random_page_cost = 1.1
effective_io_concurrency = 200
```

**Для 100,000+ пользователей:**

```conf
max_connections = 500
shared_buffers = 8GB
effective_cache_size = 24GB
maintenance_work_mem = 2GB
work_mem = 50MB
wal_buffers = 32MB
min_wal_size = 4GB
max_wal_size = 16GB
```

**Настройка connection pooling (PgBouncer):**

```bash
# Устанавливаем PgBouncer
sudo apt install pgbouncer -y

# Редактируем конфигурацию
sudo nano /etc/pgbouncer/pgbouncer.ini
```

```ini
[databases]
petcare_db = host=localhost port=5432 dbname=petcare_db

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 5
reserve_pool_size = 5
reserve_pool_timeout = 3
```

---

## 5. АВТОМАСШТАБИРОВАНИЕ

### 5.1 Настройка PM2 для автомасштабирования

```bash
# Обновляем ecosystem.config.js
nano ~/pet-care-back/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'pet-care-api',
    script: './dist/main.js',
    
    // Автомасштабирование на основе CPU
    instances: 'max',  // По количеству CPU ядер
    exec_mode: 'cluster',
    
    // Автомасштабирование на основе памяти
    max_memory_restart: '1G',
    
    // Автомасштабирование через PM2 Plus (платная функция)
    // Или используйте внешний мониторинг
    
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    
    // Автоматический перезапуск при изменении файлов (только для dev)
    watch: false,
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Логирование
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Health check
    health_check_grace_period: 3000
  }]
};
```

### 5.2 Скрипт для автомасштабирования на основе нагрузки

```bash
# Создаем скрипт автомасштабирования
nano ~/scale-app.sh
```

```bash
#!/bin/bash

# Получаем текущую нагрузку CPU
CPU_LOAD=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')

# Получаем текущее количество инстансов
CURRENT_INSTANCES=$(pm2 jlist | jq '.[] | select(.name=="pet-care-api") | .pm2_env.instances')

# Максимальное количество инстансов (по количеству CPU ядер)
MAX_INSTANCES=$(nproc)

# Минимальное количество инстансов
MIN_INSTANCES=1

echo "Current CPU load: ${CPU_LOAD}%"
echo "Current instances: ${CURRENT_INSTANCES}"
echo "Max instances: ${MAX_INSTANCES}"

# Если нагрузка выше 80%, увеличиваем количество инстансов
if (( $(echo "$CPU_LOAD > 80" | bc -l) )); then
    if [ "$CURRENT_INSTANCES" -lt "$MAX_INSTANCES" ]; then
        NEW_INSTANCES=$((CURRENT_INSTANCES + 1))
        echo "Scaling up to ${NEW_INSTANCES} instances"
        pm2 scale pet-care-api ${NEW_INSTANCES}
    fi
# Если нагрузка ниже 30%, уменьшаем количество инстансов
elif (( $(echo "$CPU_LOAD < 30" | bc -l) )); then
    if [ "$CURRENT_INSTANCES" -gt "$MIN_INSTANCES" ]; then
        NEW_INSTANCES=$((CURRENT_INSTANCES - 1))
        echo "Scaling down to ${NEW_INSTANCES} instances"
        pm2 scale pet-care-api ${NEW_INSTANCES}
    fi
fi
```

```bash
# Делаем скрипт исполняемым
chmod +x ~/scale-app.sh

# Добавляем в cron (проверка каждые 5 минут)
crontab -e
```

Добавьте строку:
```
*/5 * * * * /home/deploy/scale-app.sh >> /home/deploy/scale.log 2>&1
```

### 5.3 Использование Kubernetes для автомасштабирования

Для 100,000+ пользователей рекомендуется Kubernetes:

```bash
# Устанавливаем kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

**HPA (Horizontal Pod Autoscaler) конфигурация:**

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: pet-care-api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: pet-care-backend
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
      - type: Pods
        value: 5
        periodSeconds: 15
      selectPolicy: Max
```

---

## 6. РЕЗЕРВНОЕ КОПИРОВАНИЕ И DISASTER RECOVERY

### 6.1 Автоматическое резервное копирование PostgreSQL

```bash
# Создаем скрипт резервного копирования
nano ~/backup-db.sh
```

```bash
#!/bin/bash

# Настройки
BACKUP_DIR="/home/deploy/backups"
DB_NAME="petcare_db"
DB_USER="petcare_user"
DB_HOST="localhost"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/petcare_db_${DATE}.sql"
RETENTION_DAYS=30

# Создаем директорию для бэкапов
mkdir -p ${BACKUP_DIR}

# Создаем бэкап
PGPASSWORD=ВАШ_ПАРОЛЬ pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} -F c -f ${BACKUP_FILE}.dump

# Сжимаем бэкап
gzip ${BACKUP_FILE}.dump

# Удаляем старые бэкапы (старше RETENTION_DAYS дней)
find ${BACKUP_DIR} -name "petcare_db_*.dump.gz" -mtime +${RETENTION_DAYS} -delete

# Отправляем на удаленное хранилище (опционально)
# aws s3 cp ${BACKUP_FILE}.dump.gz s3://your-backup-bucket/
# Или
# rsync -avz ${BACKUP_FILE}.dump.gz user@backup-server:/backups/

echo "Backup completed: ${BACKUP_FILE}.dump.gz"
```

```bash
# Делаем исполняемым
chmod +x ~/backup-db.sh

# Добавляем в cron (каждый день в 2:00 ночи)
crontab -e
```

Добавьте:
```
0 2 * * * /home/deploy/backup-db.sh >> /home/deploy/backup.log 2>&1
```

### 6.2 Резервное копирование файлов (uploads)

```bash
# Создаем скрипт
nano ~/backup-files.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/deploy/backups/files"
UPLOADS_DIR="/home/deploy/pet-care-back/uploads"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/uploads_${DATE}.tar.gz"
RETENTION_DAYS=7

mkdir -p ${BACKUP_DIR}

# Создаем архив
tar -czf ${BACKUP_FILE} -C $(dirname ${UPLOADS_DIR}) $(basename ${UPLOADS_DIR})

# Удаляем старые бэкапы
find ${BACKUP_DIR} -name "uploads_*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "Files backup completed: ${BACKUP_FILE}"
```

### 6.3 Восстановление из бэкапа

```bash
# Восстановление базы данных
PGPASSWORD=ВАШ_ПАРОЛЬ pg_restore -h localhost -U petcare_user -d petcare_db -c /path/to/backup.dump.gz

# Или если это SQL файл:
gunzip < backup.sql.gz | PGPASSWORD=ВАШ_ПАРОЛЬ psql -h localhost -U petcare_user -d petcare_db

# Восстановление файлов
tar -xzf uploads_YYYYMMDD_HHMMSS.tar.gz -C /home/deploy/pet-care-back/
```

---

## 7. БЕЗОПАСНОСТЬ НА УРОВНЕ ИНФРАСТРУКТУРЫ

### 7.1 Настройка Fail2Ban (защита от брутфорса)

```bash
# Устанавливаем Fail2Ban
sudo apt install fail2ban -y

# Создаем локальную конфигурацию
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Редактируем конфигурацию
sudo nano /etc/fail2ban/jail.local
```

**Настройки:**

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = admin@yourdomain.com
sendername = Fail2Ban
action = %(action_mwl)s

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 3600
```

**Создаем фильтр для Nginx:**

```bash
sudo nano /etc/fail2ban/filter.d/nginx-limit-req.conf
```

```
[Definition]
failregex = limiting requests, excess:.* by zone.*client: <HOST>
ignoreregex =
```

```bash
# Перезапускаем Fail2Ban
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Проверяем статус
sudo fail2ban-client status
```

### 7.2 Настройка автоматических обновлений безопасности

```bash
# Устанавливаем unattended-upgrades
sudo apt install unattended-upgrades -y

# Настраиваем
sudo dpkg-reconfigure -plow unattended-upgrades

# Проверяем конфигурацию
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Убедитесь, что включено:
```
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
```

---

## 8. КОНФИГУРАЦИИ ДЛЯ 10,000 / 100,000 / 500,000 ПОЛЬЗОВАТЕЛЕЙ

### 8.1 Конфигурация для 10,000 пользователей

**Характеристики:**
- Одновременных запросов: ~500-1000
- Трафик: ~500GB-1TB/месяц
- Пиковая нагрузка: высокая

**Инфраструктура:**
```
- 2-3 сервера приложений (4 CPU, 8GB RAM каждый)
- 1 сервер БД (4 CPU, 16GB RAM, SSD)
- 1 сервер Redis (2GB RAM)
- 1 Load Balancer (Nginx/HAProxy)
- 1 сервер мониторинга (опционально)
```

**Конфигурация:**

**Nginx:**
```nginx
worker_processes auto;
worker_connections 2048;
```

**PM2:**
```javascript
instances: 'max',  // По количеству CPU на каждом сервере
max_memory_restart: '1.5G'
```

**PostgreSQL:**
```conf
max_connections = 300
shared_buffers = 2GB
effective_cache_size = 6GB
work_mem = 20MB
```

**Redis:**
```conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

**Стоимость:** ~$150-200/месяц

### 8.2 Конфигурация для 100,000 пользователей

**Характеристики:**
- Одновременных запросов: ~5000-10000
- Трафик: ~5-10TB/месяц
- Пиковая нагрузка: очень высокая

**Инфраструктура:**
```
- 5-10 серверов приложений (8 CPU, 16GB RAM каждый)
- 1 Primary БД (8 CPU, 32GB RAM, NVMe SSD)
- 1 Replica БД (8 CPU, 32GB RAM, NVMe SSD)
- Redis Cluster (3 узла по 4GB RAM)
- 1 Load Balancer (отдельный сервер или managed)
- 1 сервер мониторинга (Prometheus + Grafana)
- CDN (CloudFlare или AWS CloudFront)
```

**Конфигурация:**

**HAProxy:**
```haproxy
global
    maxconn 10000

defaults
    maxconn 5000

backend pet_care_backend
    balance leastconn
    option httpchk GET /api/health
    server app1 10.0.1.10:5000 check
    server app2 10.0.1.11:5000 check
    # ... еще 8 серверов
```

**PM2 (на каждом сервере):**
```javascript
instances: 'max',  // 8 инстансов на сервере
max_memory_restart: '2G'
```

**PostgreSQL Primary:**
```conf
max_connections = 500
shared_buffers = 8GB
effective_cache_size = 24GB
work_mem = 50MB
```

**PostgreSQL Replica:**
```conf
# Только для чтения
hot_standby = on
max_connections = 200
```

**Redis Cluster:**
```conf
# На каждом узле
maxmemory 4gb
maxmemory-policy allkeys-lru
cluster-enabled yes
```

**Стоимость:** ~$800-1200/месяц

### 8.3 Конфигурация для 500,000 пользователей

**Характеристики:**
- Одновременных запросов: ~25000-50000
- Трафик: ~25-50TB/месяц
- Пиковая нагрузка: экстремальная

**Рекомендуемая архитектура: Kubernetes или Managed Services**

**Вариант 1: Kubernetes (self-hosted)**

```
- Kubernetes кластер: 10-20 worker nodes (8 CPU, 16GB RAM каждый)
- Auto-scaling: 10-50 pods приложения
- Managed PostgreSQL: AWS RDS или Google Cloud SQL
  - Primary: 16 CPU, 64GB RAM
  - 2 Replicas: 16 CPU, 64GB RAM каждый
- Managed Redis: AWS ElastiCache или Redis Cloud
  - Cluster mode: 5 узлов по 8GB RAM
- Load Balancer: Kubernetes Ingress + Cloud Load Balancer
- CDN: CloudFlare Pro или AWS CloudFront
- Monitoring: Prometheus + Grafana на отдельном кластере
```

**Вариант 2: Managed Services (AWS/GCP/Azure)**

```
- Compute: AWS ECS/EKS или Google Cloud Run/GKE
  - Auto-scaling: 20-100 инстансов
- Database: AWS RDS PostgreSQL или Google Cloud SQL
  - High Availability: Multi-AZ
  - Read Replicas: 3-5 реплик
- Cache: AWS ElastiCache Redis или Google Memorystore
  - Cluster mode: 5-10 узлов
- Load Balancer: AWS ALB/NLB или Google Cloud Load Balancing
- CDN: AWS CloudFront или Google Cloud CDN
- Monitoring: AWS CloudWatch или Google Cloud Monitoring
```

**Конфигурация Kubernetes:**

```yaml
# Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: pet-care-backend
spec:
  replicas: 20  # Начальное количество
  selector:
    matchLabels:
      app: pet-care-backend
  template:
    spec:
      containers:
      - name: app
        image: pet-care-backend:latest
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
---
# HPA
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: pet-care-backend-hpa
spec:
  minReplicas: 20
  maxReplicas: 100
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**Стоимость:** ~$3000-5000/месяц

---

## 📊 СВОДНАЯ ТАБЛИЦА КОНФИГУРАЦИЙ

| Параметр | 10K | 100K | 500K |
|----------|-----|------|------|
| **Серверы приложений** |
| Количество | 2-3 | 5-10 | 20-100 (auto) |
| CPU каждый | 4 | 8 | 8 |
| RAM каждый | 8GB | 16GB | 16GB |
| **База данных** |
| Серверов | 1 | 2 (P+R) | 3-5 (P+R+R) |
| CPU Primary | 4 | 8 | 16 |
| RAM Primary | 16GB | 32GB | 64GB |
| **Кэш** |
| Redis | 1 сервер | Cluster 3 узла | Cluster 5-10 узлов |
| RAM Redis | 2GB | 4GB/узел | 8GB/узел |
| **Load Balancer** |
| Тип | Nginx | HAProxy | Managed LB |
| **CDN** | Нет | Рекомендуется | Обязательно |
| **Мониторинг** | Базовый | Полный | Enterprise |
| **Стоимость/мес** | $150-200 | $800-1200 | $3000-5000 |

---

## ✅ ФИНАЛЬНЫЙ ЧЕКЛИСТ ДЛЯ PRODUCTION

### Безопасность
- [ ] Все пароли изменены на сильные
- [ ] SSH ключи настроены (отключен парольный доступ)
- [ ] Firewall настроен (UFW)
- [ ] Fail2Ban установлен и настроен
- [ ] SSL сертификаты установлены и автообновляются
- [ ] Регулярные обновления безопасности включены

### Инфраструктура
- [ ] Load Balancer настроен
- [ ] Несколько серверов приложений (для 10K+)
- [ ] База данных оптимизирована
- [ ] Redis настроен для кэширования
- [ ] Резервное копирование настроено и протестировано

### Мониторинг
- [ ] Prometheus установлен и собирает метрики
- [ ] Grafana настроена с дашбордами
- [ ] Alertmanager настроен с уведомлениями
- [ ] Health checks работают

### Производительность
- [ ] Nginx/HAProxy оптимизирован
- [ ] Кэширование настроено
- [ ] Connection pooling настроен (PgBouncer)
- [ ] Автомасштабирование настроено (для 100K+)

---

## 🔧 ПОЛЕЗНЫЕ КОМАНДЫ ДЛЯ МОНИТОРИНГА

```bash
# Мониторинг сервера
htop                    # Интерактивный мониторинг процессов
iostat -x 1            # Мониторинг дисков
netstat -tulpn         # Сетевые соединения
df -h                  # Использование диска
free -h                # Использование памяти

# Мониторинг приложения
pm2 monit              # Мониторинг PM2 в реальном времени
pm2 logs               # Логи всех приложений
pm2 describe pet-care-api  # Детальная информация

# Мониторинг базы данных
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
sudo -u postgres psql -c "SELECT * FROM pg_stat_database WHERE datname='petcare_db';"

# Мониторинг Redis
redis-cli INFO
redis-cli --stat

# Мониторинг Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Проверка Load Balancer
curl -I https://api.yourdomain.com/api/health
```

---

**Конец Части 2**

**Полный план деплоя готов!** Используйте Часть 1 для базовой настройки и Часть 2 для масштабирования и оптимизации.

