# 🚀 Руководство по CI/CD

Это руководство описывает автоматизированный процесс развертывания (CI/CD) для Pet Care Backend API.

## 📋 Содержание

1. [Обзор CI/CD](#обзор-cicd)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Настройка секретов](#настройка-секретов)
4. [Процесс деплоя](#процесс-деплоя)
5. [Использование скриптов](#использование-скриптов)
6. [Troubleshooting](#troubleshooting)

---

## 🔄 Обзор CI/CD

Проект использует **GitHub Actions** для автоматизации CI/CD процесса:

### CI (Continuous Integration)
- **Файл:** `.github/workflows/ci.yml`
- **Триггеры:** Push в `main`/`develop`, Pull Requests
- **Действия:**
  - ✅ Установка зависимостей
  - ✅ Генерация Prisma Client
  - ✅ Применение миграций
  - ✅ Линтинг кода
  - ✅ Запуск unit тестов
  - ✅ Запуск E2E тестов
  - ✅ Сборка приложения
  - ✅ Сохранение артефактов

### CD (Continuous Deployment)
- **Файл:** `.github/workflows/cd.yml`
- **Триггеры:** 
  - Push в `main` → деплой в **production**
  - Push в `develop` → деплой в **staging**
  - Ручной запуск (workflow_dispatch)
- **Действия:**
  - ✅ Запуск тестов (опционально)
  - ✅ Сборка Docker образа
  - ✅ Публикация в GitHub Container Registry
  - ✅ Деплой в Docker (staging/development)
  - ✅ Деплой в Kubernetes (production)
  - ✅ Health checks
  - ✅ Уведомления

---

## 📁 GitHub Actions Workflows

### CI Workflow (`.github/workflows/ci.yml`)

**Когда запускается:**
- При каждом push в `main` или `develop`
- При создании Pull Request в `main` или `develop`

**Что делает:**
1. Запускает PostgreSQL в сервисе
2. Устанавливает зависимости
3. Генерирует Prisma Client
4. Применяет миграции
5. Запускает линтер
6. Запускает тесты (unit + E2E)
7. Собирает приложение
8. Сохраняет артефакты сборки

**Результат:**
- ✅ Успех: код готов к деплою
- ❌ Ошибка: деплой не выполняется

### CD Workflow (`.github/workflows/cd.yml`)

**Когда запускается:**
- Автоматически: при push в `main` (production) или `develop` (staging)
- Вручную: через GitHub UI (Actions → CD → Run workflow)

**Что делает:**

#### 1. Определение окружения
- `main` → `production`
- `develop` → `staging`
- Другие ветки → `development` (без деплоя)

#### 2. Тестирование (если не пропущено)
- Запускает все тесты из CI workflow

#### 3. Сборка и публикация Docker образа
- Собирает multi-stage Docker образ
- Публикует в GitHub Container Registry (`ghcr.io`)
- Тегирует образ по окружению и версии

#### 4. Деплой

**Для staging/development:**
- Использует Docker Compose
- Подключается к серверу по SSH
- Обновляет код
- Запускает `scripts/deploy.sh`
- Проверяет health check

**Для production:**
- Использует Kubernetes
- Обновляет deployment с новым образом
- Применяет все манифесты из `k8s/`
- Ожидает готовности подов
- Проверяет rollout статус

#### 5. Уведомления
- Отправляет уведомления об успехе/ошибке

---

## 🔐 Настройка секретов

Для работы CI/CD необходимо настроить секреты в GitHub:

### Обязательные секреты

#### Для Docker деплоя (staging/development):
1. **`DEPLOY_HOST`** - IP адрес или домен сервера
   ```
   Пример: 192.168.1.100 или staging.example.com
   ```

2. **`DEPLOY_USER`** - Пользователь для SSH подключения
   ```
   Пример: deploy или ubuntu
   ```

3. **`DEPLOY_SSH_KEY`** - Приватный SSH ключ для подключения
   ```bash
   # Генерация ключа (если нет):
   ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
   
   # Добавьте публичный ключ на сервер:
   ssh-copy-id -i ~/.ssh/github_actions.pub deploy@your-server
   
   # Скопируйте приватный ключ в GitHub Secrets:
   cat ~/.ssh/github_actions
   ```

#### Для Kubernetes деплоя (production):
1. **`KUBECONFIG`** - Конфигурация kubectl (base64 encoded)
   ```bash
   # Получите kubeconfig с вашего кластера:
   kubectl config view --flatten > kubeconfig.txt
   
   # Закодируйте в base64:
   cat kubeconfig.txt | base64 -w 0
   
   # Вставьте результат в GitHub Secret KUBECONFIG
   ```

2. **`K8S_NAMESPACE`** (опционально) - Namespace для деплоя
   ```
   По умолчанию: default
   ```

### Как добавить секреты в GitHub:

1. Перейдите в репозиторий на GitHub
2. Settings → Secrets and variables → Actions
3. Нажмите "New repository secret"
4. Введите имя и значение
5. Сохраните

---

## 🚀 Процесс деплоя

### Автоматический деплой

#### Деплой в Staging:
```bash
# Просто сделайте push в develop:
git checkout develop
git add .
git commit -m "feat: new feature"
git push origin develop
```

GitHub Actions автоматически:
1. Запустит тесты
2. Соберет Docker образ
3. Задеплоит на staging сервер

#### Деплой в Production:
```bash
# Сделайте push в main (после merge PR):
git checkout main
git merge develop
git push origin main
```

GitHub Actions автоматически:
1. Запустит тесты
2. Соберет Docker образ
3. Задеплоит в Kubernetes кластер

### Ручной деплой

1. Перейдите в GitHub → Actions
2. Выберите workflow "CD - Continuous Deployment"
3. Нажмите "Run workflow"
4. Выберите:
   - **Environment:** staging или production
   - **Skip tests:** true/false (опционально)
5. Нажмите "Run workflow"

### Локальный деплой (без CI/CD)

#### Docker Compose:
```bash
# Development
./scripts/deploy.sh development

# Staging
./scripts/deploy.sh staging

# Production
./scripts/deploy.sh production
```

#### Kubernetes:
```bash
# С указанием namespace
./scripts/k8s-deploy.sh production my-namespace

# С указанием образа
./scripts/k8s-deploy.sh production default v1.2.3 ghcr.io/username/pet-care-backend
```

---

## 📜 Использование скриптов

### `scripts/deploy.sh`

Скрипт для деплоя через Docker Compose.

**Синтаксис:**
```bash
./scripts/deploy.sh [environment] [image-tag] [use-existing-image]
```

**Параметры:**
- `environment` - Окружение: `development`, `staging`, `production` (по умолчанию: `development`)
- `image-tag` - Тег Docker образа (по умолчанию: `latest`)
- `use-existing-image` - Использовать существующий образ вместо сборки (по умолчанию: `false`)

**Примеры:**
```bash
# Деплой в development с автоматической сборкой
./scripts/deploy.sh development

# Деплой в production с конкретным тегом
./scripts/deploy.sh production v1.2.3

# Использование существующего образа (для CI/CD)
./scripts/deploy.sh staging latest true
```

**Что делает скрипт:**
1. Проверяет окружение и переменные
2. Собирает проект (если нужно)
3. Генерирует Prisma Client
4. Собирает Docker образ (если нужно)
5. Применяет миграции БД (с подтверждением)
6. Останавливает старые контейнеры
7. Запускает новые контейнеры
8. Проверяет health check
9. Выводит статус

### `scripts/k8s-deploy.sh`

Скрипт для деплоя в Kubernetes.

**Синтаксис:**
```bash
./scripts/k8s-deploy.sh [environment] [namespace] [image-tag] [image-name] [skip-migrations]
```

**Параметры:**
- `environment` - Окружение (по умолчанию: `production`)
- `namespace` - Kubernetes namespace (по умолчанию: `default`)
- `image-tag` - Тег образа (по умолчанию: `latest`)
- `image-name` - Имя образа (по умолчанию: `pet-care-backend`)
- `skip-migrations` - Пропустить миграции (по умолчанию: `false`)

**Примеры:**
```bash
# Базовый деплой
./scripts/k8s-deploy.sh production default

# С указанием namespace и образа
./scripts/k8s-deploy.sh production pet-care v1.2.3 ghcr.io/username/pet-care-backend

# С пропуском миграций
./scripts/k8s-deploy.sh production default latest pet-care-backend true
```

**Что делает скрипт:**
1. Проверяет kubectl и подключение к кластеру
2. Создает namespace (если не существует)
3. Применяет ConfigMap
4. Применяет Redis deployment
5. Применяет миграции БД (если нужно)
6. Обновляет образ в deployment
7. Применяет основной deployment
8. Применяет HPA
9. Ожидает готовности подов
10. Проверяет rollout статус
11. Выводит статус

---

## 🔧 Интеграция с существующими файлами

CI/CD процесс использует все существующие файлы проекта:

### Docker файлы:
- ✅ `Dockerfile` - Multi-stage build
- ✅ `docker-compose.yml` - Development окружение
- ✅ `docker-compose.prod.yml` - Production окружение

### Kubernetes манифесты:
- ✅ `k8s/configmap.yaml` - Конфигурация
- ✅ `k8s/deployment.yaml` - Основной deployment
- ✅ `k8s/hpa.yaml` - Автомасштабирование
- ✅ `k8s/redis-deployment.yaml` - Redis

### Скрипты:
- ✅ `scripts/deploy.sh` - Docker деплой
- ✅ `scripts/k8s-deploy.sh` - Kubernetes деплой

---

## 🐛 Troubleshooting

### Проблема: CI/CD не запускается

**Решение:**
1. Проверьте, что файлы workflows находятся в `.github/workflows/`
2. Убедитесь, что ветка называется `main` или `develop`
3. Проверьте права доступа к репозиторию

### Проблема: Деплой не выполняется

**Решение:**
1. Проверьте секреты в GitHub Settings → Secrets
2. Убедитесь, что SSH ключ добавлен на сервер
3. Проверьте логи в GitHub Actions

### Проблема: Docker образ не собирается

**Решение:**
1. Проверьте `Dockerfile` на ошибки
2. Убедитесь, что все зависимости в `package.json`
3. Проверьте логи сборки в GitHub Actions

### Проблема: Kubernetes деплой не работает

**Решение:**
1. Проверьте `KUBECONFIG` секрет (должен быть base64)
2. Убедитесь, что кластер доступен
3. Проверьте права доступа к namespace
4. Проверьте логи подов: `kubectl logs -f deployment/pet-care-backend`

### Проблема: Health check не проходит

**Решение:**
1. Проверьте, что приложение запущено: `docker ps` или `kubectl get pods`
2. Проверьте логи: `docker-compose logs` или `kubectl logs`
3. Убедитесь, что порт 5000 доступен
4. Проверьте переменные окружения

### Проблема: Миграции не применяются

**Решение:**
1. Проверьте `DATABASE_URL` в секретах/переменных окружения
2. Убедитесь, что БД доступна
3. Примените миграции вручную: `npx prisma migrate deploy`

---

## 📊 Мониторинг деплоев

### GitHub Actions
- Перейдите в **Actions** вкладку репозитория
- Просматривайте статус последних запусков
- Открывайте логи для детальной информации

### Проверка статуса деплоя

**Docker:**
```bash
# Статус контейнеров
docker-compose ps

# Логи
docker-compose logs -f app

# Health check
curl http://localhost:5000/api/health
```

**Kubernetes:**
```bash
# Статус подов
kubectl get pods -l app=pet-care-backend

# Логи
kubectl logs -f deployment/pet-care-backend

# События
kubectl get events --sort-by='.lastTimestamp'

# Описание deployment
kubectl describe deployment/pet-care-backend
```

---

## 🎯 Best Practices

1. **Всегда тестируйте на staging перед production**
   - Используйте `develop` ветку для staging деплоев
   - Проверяйте все функции перед merge в `main`

2. **Используйте теги для версионирования**
   - Создавайте теги для важных релизов
   - Docker образы будут тегироваться автоматически

3. **Мониторьте деплои**
   - Проверяйте логи после каждого деплоя
   - Настройте алерты на ошибки

4. **Резервное копирование**
   - Делайте бэкапы БД перед production деплоем
   - Храните старые Docker образы для rollback

5. **Rollback план**
   - Знайте, как откатить деплой
   - Тестируйте процесс rollback

---

## 📚 Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [DEPLOYMENT_GUIDE_PART1.md](./DEPLOYMENT_GUIDE_PART1.md) - Ручной деплой
- [DEPLOYMENT_GUIDE_PART2.md](./DEPLOYMENT_GUIDE_PART2.md) - Масштабирование

---

**Готово!** Теперь у вас есть полностью автоматизированный CI/CD процесс! 🎉

