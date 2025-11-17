# Pet Care Backend API

Backend приложение для управления уходом за домашними животными, построенное на NestJS.

## 🚀 Возможности

- **Аутентификация и авторизация** - JWT-based аутентификация с refresh tokens
- **Управление питомцами** - Полный CRUD для питомцев, паспортов, карточек здоровья
- **Медицинские записи** - Вакцинации, медикаменты, визиты в клиники
- **Услуги** - Груминг, передержка, медицинские услуги
- **Сообщество** - Посты, комментарии, лайки, события
- **Приюты** - Управление приютами и животными
- **Платежи** - Интеграция со Stripe для обработки платежей
- **Уведомления** - Система уведомлений для важных событий

## 📋 Требования

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm или yarn

## 🛠️ Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd pet-care-back

# Установка зависимостей
npm install

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Настройка базы данных
npx prisma generate
npx prisma migrate dev

# Запуск приложения
npm run start:dev
```

## 🔧 Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# App
NODE_ENV=development
PORT=5000
API_PREFIX=api

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/petcare

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

## 📚 API Документация

После запуска приложения, Swagger документация доступна по адресу:
- Development: `http://localhost:5000/api/docs`

## 🏗️ Архитектура

Проект следует принципам модульной архитектуры NestJS:

```
src/
├── common/              # Общие компоненты
│   ├── decorators/      # Декораторы
│   ├── dto/             # Базовые DTO
│   ├── filters/         # Exception filters
│   ├── guards/          # Guards для авторизации
│   ├── interceptors/    # Interceptors
│   ├── services/        # Базовые сервисы
│   └── utils/           # Утилиты
├── config/              # Конфигурация
├── auth/                # Аутентификация
├── user/                # Пользователи
├── pet/                 # Питомцы
├── health/              # Health checks
└── ...                  # Другие модули
```

## 🔒 Безопасность

- ✅ Helmet для защиты заголовков
- ✅ CORS настройка
- ✅ Rate Limiting
- ✅ Глобальная валидация входных данных
- ✅ JWT аутентификация
- ✅ Guards для проверки прав доступа
- ✅ Валидация переменных окружения

## 🧪 Тестирование

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# Покрытие кода
npm run test:cov
```

## 📦 Скрипты

```bash
# Разработка
npm run start:dev

# Production
npm run build
npm run start:prod

# Линтинг
npm run lint

# Форматирование
npm run format

# Миграции Prisma
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

## 🏥 Health Checks

- `/api/health` - Полная проверка состояния
- `/api/health/liveness` - Liveness probe для Kubernetes
- `/api/health/readiness` - Readiness probe для Kubernetes

## 📝 Миграции базы данных

```bash
# Создание новой миграции
npx prisma migrate dev --name migration_name

# Применение миграций в production
npx prisma migrate deploy

# Просмотр базы данных
npx prisma studio
```

## 🔍 Логирование

Приложение использует встроенный Logger NestJS для структурированного логирования:
- Ошибки логируются с полным контекстом
- В development режиме показываются stack traces
- В production режиме детали ошибок скрыты

## 🚨 Обработка ошибок

Все ошибки обрабатываются глобальным `HttpExceptionFilter`:
- Единообразный формат ответов
- Структурированное логирование
- Безопасность в production (скрытие деталей)

## 📈 Производительность

- Пагинация для всех списков
- Индексы в базе данных (см. PRISMA_INDEXES.md)
- Rate Limiting для защиты от злоупотреблений
- Connection pooling для Prisma

## 🤝 Вклад в проект

1. Создайте ветку для вашей функции (`git checkout -b feature/AmazingFeature`)
2. Закоммитьте изменения (`git commit -m 'Add some AmazingFeature'`)
3. Запушьте в ветку (`git push origin feature/AmazingFeature`)
4. Откройте Pull Request

## 📄 Лицензия

Этот проект является приватным и не имеет публичной лицензии.

## 📞 Контакты

Для вопросов и предложений создайте issue в репозитории.

---

**Примечание**: Для получения подробной информации об улучшениях проекта см. [IMPROVEMENTS.md](./IMPROVEMENTS.md)
