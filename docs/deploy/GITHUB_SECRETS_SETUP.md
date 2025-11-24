# 🔐 Настройка секретов в GitHub для CI/CD

Это руководство поможет настроить все необходимые секреты для автоматического деплоя через GitHub Actions.

---

## 📋 Содержание

1. [Разница между Docker и Kubernetes](#разница-между-docker-и-kubernetes)
2. [Настройка секретов для Docker деплоя](#настройка-секретов-для-docker-деплоя)
3. [Настройка секретов для Kubernetes деплоя](#настройка-секретов-для-kubernetes-деплоя)
4. [Бесплатные серверы для тестирования](#бесплатные-серверы-для-тестирования)
5. [Подключение GitHub Actions к серверам](#подключение-github-actions-к-серверам)

---

## 🐳 Разница между Docker и Kubernetes

### Docker (для staging/development)

**Что это:**
- Платформа для контейнеризации приложений
- Запускает приложение в изолированных контейнерах
- Простая настройка и управление
- Подходит для небольших и средних проектов

**Когда использовать:**
- ✅ Staging окружение
- ✅ Development окружение
- ✅ Небольшие проекты (до 10,000 пользователей)
- ✅ Простые архитектуры (1-3 сервера)

**Преимущества:**
- Простота настройки
- Быстрый деплой
- Низкие требования к инфраструктуре
- Легко откатить изменения

**Недостатки:**
- Ручное масштабирование
- Нет автоматического восстановления
- Ограниченная оркестрация

### Kubernetes (для production)

**Что это:**
- Платформа для оркестрации контейнеров
- Автоматическое масштабирование и управление
- Высокая доступность и отказоустойчивость
- Подходит для больших и сложных проектов

**Когда использовать:**
- ✅ Production окружение
- ✅ Большие проекты (10,000+ пользователей)
- ✅ Требуется автомасштабирование
- ✅ Высокая доступность критична

**Преимущества:**
- Автоматическое масштабирование
- Автоматическое восстановление при сбоях
- Управление несколькими серверами
- Rolling updates без простоя
- Service discovery и load balancing

**Недостатки:**
- Сложная настройка
- Требует больше ресурсов
- Кривая обучения выше

### Сравнительная таблица

| Параметр | Docker | Kubernetes |
|----------|--------|------------|
| **Сложность** | Низкая | Высокая |
| **Масштабирование** | Ручное | Автоматическое |
| **Отказоустойчивость** | Базовая | Высокая |
| **Подходит для** | Staging/Dev | Production |
| **Ресурсы** | Минимум | Больше |
| **Время деплоя** | Быстро | Средне |

---

## 🔑 Настройка секретов для Docker деплоя

### Шаг 1: Подготовка SSH ключа

```bash
# Генерация SSH ключа (если нет)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Или используйте существующий ключ
```

**Результат:**
- `~/.ssh/github_actions_deploy` - приватный ключ (для GitHub)
- `~/.ssh/github_actions_deploy.pub` - публичный ключ (для сервера)

### Шаг 2: Добавление публичного ключа на сервер

```bash
# Скопируйте публичный ключ на сервер
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub deploy@YOUR_SERVER_IP

# Или вручную:
cat ~/.ssh/github_actions_deploy.pub
# Скопируйте вывод и добавьте в ~/.ssh/authorized_keys на сервере
```

**На сервере:**
```bash
# Подключитесь к серверу
ssh deploy@YOUR_SERVER_IP

# Создайте директорию для проекта (если нет)
mkdir -p ~/pet-care-back
cd ~/pet-care-back

# Убедитесь, что директория существует и доступна
```

### Шаг 3: Добавление секретов в GitHub

1. Перейдите в ваш репозиторий на GitHub
2. Нажмите **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**

#### Секрет 1: `DEPLOY_HOST`
- **Name:** `DEPLOY_HOST`
- **Value:** IP адрес или домен вашего сервера
  ```
  Пример: 192.168.1.100
  Или: staging.example.com
  ```

#### Секрет 2: `DEPLOY_USER`
- **Name:** `DEPLOY_USER`
- **Value:** Имя пользователя для SSH подключения
  ```
  Пример: deploy
  Или: ubuntu
  ```

#### Секрет 3: `DEPLOY_SSH_KEY`
- **Name:** `DEPLOY_SSH_KEY`
- **Value:** Содержимое приватного SSH ключа
  ```bash
  # Скопируйте приватный ключ:
  cat ~/.ssh/github_actions_deploy
  
  # Вставьте ВСЁ содержимое (включая -----BEGIN и -----END)
  ```

**Важно:** 
- Не добавляйте переносы строк вручную
- Скопируйте ключ полностью, включая заголовки
- Ключ должен начинаться с `-----BEGIN OPENSSH PRIVATE KEY-----`

### Шаг 4: Проверка подключения

```bash
# Проверьте подключение с вашего компьютера
ssh -i ~/.ssh/github_actions_deploy deploy@YOUR_SERVER_IP

# Если подключение успешно, секреты настроены правильно
```

---

## ☸️ Настройка секретов для Kubernetes деплоя

### Шаг 1: Получение kubeconfig

**Для локального кластера (minikube):**
```bash
# Получите kubeconfig
kubectl config view --flatten > kubeconfig.txt
```

**Для облачного кластера (AWS EKS, Google GKE, DigitalOcean):**
```bash
# AWS EKS
aws eks update-kubeconfig --name your-cluster-name --region your-region

# Google GKE
gcloud container clusters get-credentials your-cluster-name --zone your-zone

# DigitalOcean
doctl kubernetes cluster kubeconfig save your-cluster-id

# Затем экспортируйте
kubectl config view --flatten > kubeconfig.txt
```

### Шаг 2: Кодирование kubeconfig в base64

```bash
# Закодируйте kubeconfig в base64
cat kubeconfig.txt | base64 -w 0

# Или на macOS:
cat kubeconfig.txt | base64 | tr -d '\n'
```

**Скопируйте результат** (это длинная строка base64)

### Шаг 3: Добавление секретов в GitHub

#### Секрет 1: `KUBECONFIG`
- **Name:** `KUBECONFIG`
- **Value:** Закодированный в base64 kubeconfig (из шага 2)

#### Секрет 2: `K8S_NAMESPACE` (опционально)
- **Name:** `K8S_NAMESPACE`
- **Value:** Namespace для деплоя
  ```
  По умолчанию: default
  Или: pet-care-production
  ```

### Шаг 4: Проверка подключения

```bash
# Проверьте подключение к кластеру
kubectl get nodes

# Если видите список узлов, подключение работает
```

---

## 🆓 Бесплатные серверы для тестирования

### 1. **Oracle Cloud Free Tier** (Рекомендуется)

**Что включено:**
- ✅ 2 VM инстанса (AMD) - всегда бесплатно
- ✅ 4 OCPU, 24GB RAM на каждый
- ✅ 200GB блок storage
- ✅ 10TB исходящий трафик/месяц
- ✅ Без ограничения по времени

**Регистрация:**
1. Перейдите на [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)
2. Зарегистрируйтесь (требуется кредитная карта, но не списывается)
3. Создайте VM инстанс

**Создание сервера:**
```bash
# После регистрации в Oracle Cloud Console:
# 1. Compute → Instances → Create Instance
# 2. Выберите: Always Free Eligible
# 3. Image: Ubuntu 22.04
# 4. Shape: VM.Standard.A1.Flex (4 OCPU, 24GB RAM)
# 5. Создайте SSH ключ и скачайте его
```

**Подключение:**
```bash
# Используйте скачанный приватный ключ
chmod 400 ~/Downloads/your-key.key
ssh -i ~/Downloads/your-key.key ubuntu@YOUR_PUBLIC_IP
```

### 2. **Google Cloud Platform (GCP) Free Tier**

**Что включено:**
- ✅ $300 кредитов на 90 дней
- ✅ Always Free: f1-micro инстанс (1 vCPU, 0.6GB RAM)
- ✅ 30GB дискового пространства
- ✅ 1GB исходящий трафик/месяц

**Регистрация:**
1. [cloud.google.com/free](https://cloud.google.com/free)
2. Активируйте бесплатный пробный период

**Создание сервера:**
```bash
# В GCP Console:
# 1. Compute Engine → VM instances → Create
# 2. Machine type: f1-micro (Always Free)
# 3. Boot disk: Ubuntu 22.04 LTS, 30GB
# 4. Firewall: Allow HTTP/HTTPS traffic
```

### 3. **AWS Free Tier**

**Что включено:**
- ✅ 750 часов t2.micro (1 vCPU, 1GB RAM) в месяц
- ✅ 30GB EBS storage
- ✅ 15GB исходящий трафик/месяц
- ✅ Действует 12 месяцев

**Регистрация:**
1. [aws.amazon.com/free](https://aws.amazon.com/free/)
2. Создайте аккаунт

**Создание сервера:**
```bash
# В AWS Console:
# 1. EC2 → Launch Instance
# 2. AMI: Ubuntu Server 22.04 LTS
# 3. Instance type: t2.micro (Free tier eligible)
# 4. Configure security group: Allow SSH (22), HTTP (80), HTTPS (443)
```

### 4. **DigitalOcean** (с промокодом)

**Что включено:**
- ✅ $200 кредитов на 60 дней (по промокоду)
- ✅ Droplet: $6/месяц (1 vCPU, 1GB RAM)
- ✅ Нет ограничений по времени после промокода

**Регистрация:**
1. [digitalocean.com](https://www.digitalocean.com/)
2. Используйте промокод (поищите актуальные)

### 5. **Railway** (Для простых деплоев)

**Что включено:**
- ✅ $5 бесплатных кредитов/месяц
- ✅ Автоматический деплой из GitHub
- ✅ PostgreSQL и Redis включены
- ✅ Простая настройка

**Регистрация:**
1. [railway.app](https://railway.app/)
2. Подключите GitHub репозиторий
3. Автоматический деплой!

### Сравнительная таблица

| Провайдер | RAM | CPU | Storage | Трафик | Ограничение |
|-----------|-----|-----|---------|--------|-------------|
| **Oracle** | 24GB | 4 | 200GB | 10TB | Нет |
| **GCP** | 0.6GB | 1 | 30GB | 1GB | Always Free |
| **AWS** | 1GB | 1 | 30GB | 15GB | 12 месяцев |
| **DigitalOcean** | 1GB | 1 | 25GB | 1TB | С промокодом |
| **Railway** | Зависит | Зависит | Зависит | Зависит | $5/месяц |

**Рекомендация:** Начните с **Oracle Cloud** - лучший вариант для тестирования.

---

## 🔌 Подключение GitHub Actions к серверам

### Вариант 1: SSH подключение (для Docker деплоя)

#### Шаг 1: Настройка сервера

```bash
# Подключитесь к серверу
ssh deploy@YOUR_SERVER_IP

# Установите необходимые инструменты
sudo apt update
sudo apt install -y git docker.io docker-compose

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker

# Проверьте установку
docker --version
docker-compose --version
```

#### Шаг 2: Настройка Git на сервере

```bash
# Клонируйте репозиторий (если еще не клонирован)
cd ~
git clone https://github.com/YOUR_USERNAME/pet-care-back.git
cd pet-care-back

# Или если репозиторий уже есть, обновите его
cd ~/pet-care-back
git pull origin develop
```

#### Шаг 3: Настройка .env файла

```bash
# Создайте .env файл на сервере
cd ~/pet-care-back
nano .env
```

**Минимальный .env:**
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/petcare
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
CORS_ORIGIN=https://yourdomain.com
```

#### Шаг 4: Настройка GitHub Actions

Секреты уже должны быть настроены (см. раздел выше).

**Проверка:**
1. GitHub → Settings → Secrets and variables → Actions
2. Убедитесь, что есть:
   - ✅ `DEPLOY_HOST`
   - ✅ `DEPLOY_USER`
   - ✅ `DEPLOY_SSH_KEY`

#### Шаг 5: Тестовый деплой

```bash
# Сделайте push в develop ветку
git checkout develop
git add .
git commit -m "test: test deployment"
git push origin develop
```

GitHub Actions автоматически:
1. Запустит тесты
2. Соберет Docker образ
3. Задеплоит на сервер через SSH

### Вариант 2: Kubernetes подключение

#### Шаг 1: Создание Kubernetes кластера

**Для тестирования используйте minikube локально:**

```bash
# Установите minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Запустите кластер
minikube start

# Проверьте
kubectl get nodes
```

**Или используйте managed Kubernetes:**
- AWS EKS
- Google GKE
- DigitalOcean Kubernetes

#### Шаг 2: Настройка секретов в Kubernetes

```bash
# Создайте namespace
kubectl create namespace pet-care-production

# Создайте секреты
kubectl create secret generic pet-care-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/db' \
  --from-literal=jwt-secret='your-jwt-secret' \
  -n pet-care-production
```

#### Шаг 3: Настройка GitHub Actions

1. Добавьте секреты в GitHub:
   - `KUBECONFIG` (base64 encoded)
   - `K8S_NAMESPACE` (опционально, по умолчанию: default)

2. Сделайте push в `main` ветку

GitHub Actions автоматически:
1. Запустит тесты
2. Соберет Docker образ
3. Задеплоит в Kubernetes кластер

---

## ✅ Чеклист настройки

### Для Docker деплоя:
- [ ] SSH ключ сгенерирован
- [ ] Публичный ключ добавлен на сервер
- [ ] Приватный ключ добавлен в GitHub Secrets как `DEPLOY_SSH_KEY`
- [ ] `DEPLOY_HOST` добавлен в GitHub Secrets
- [ ] `DEPLOY_USER` добавлен в GitHub Secrets
- [ ] Сервер настроен (Docker, docker-compose установлены)
- [ ] Репозиторий клонирован на сервер
- [ ] `.env` файл создан на сервере
- [ ] Тестовый деплой выполнен успешно

### Для Kubernetes деплоя:
- [ ] Kubernetes кластер создан
- [ ] `kubectl` настроен и работает
- [ ] `kubeconfig` экспортирован и закодирован в base64
- [ ] `KUBECONFIG` добавлен в GitHub Secrets
- [ ] `K8S_NAMESPACE` добавлен в GitHub Secrets (опционально)
- [ ] Секреты созданы в Kubernetes кластере
- [ ] Тестовый деплой выполнен успешно

---

## 🐛 Troubleshooting

### Проблема: SSH подключение не работает

**Решение:**
```bash
# Проверьте подключение вручную
ssh -i ~/.ssh/github_actions_deploy deploy@YOUR_SERVER_IP

# Проверьте права на ключ
chmod 600 ~/.ssh/github_actions_deploy

# Проверьте, что ключ добавлен в authorized_keys на сервере
ssh deploy@YOUR_SERVER_IP "cat ~/.ssh/authorized_keys"
```

### Проблема: Kubernetes деплой не работает

**Решение:**
```bash
# Проверьте подключение к кластеру
kubectl get nodes

# Проверьте секреты
kubectl get secrets -n your-namespace

# Проверьте логи GitHub Actions для детальной информации
```

### Проблема: Docker образ не собирается

**Решение:**
```bash
# Проверьте Dockerfile
docker build -t test-image .

# Проверьте логи в GitHub Actions
# Actions → Ваш workflow → Build job → View logs
```

---

## 📚 Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) - Полное руководство по CI/CD

---

**Готово!** Теперь у вас настроен автоматический деплой через GitHub Actions! 🎉

