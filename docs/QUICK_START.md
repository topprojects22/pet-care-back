# Быстрый старт

## 🚀 Запуск проекта

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка базы данных

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Отредактируйте `.env` и укажите:
- `DATABASE_URL` - строка подключения к PostgreSQL
- `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)

### 3. Настройка базы данных

```bash
# Генерация Prisma клиента
npx prisma generate

# Применение миграций
npx prisma migrate dev

# (Опционально) Просмотр базы данных
npx prisma studio
```

### 4. Запуск приложения

```bash
# Development режим
npm run start:dev

# Production режим
npm run build
npm run start:prod
```

### 5. Проверка работы

- API доступно на: `http://localhost:5000/api`
- Swagger документация: `http://localhost:5000/api/docs`
- Health check: `http://localhost:5000/api/health`

---

## 📝 Первые шаги

### Регистрация пользователя

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Вход в систему

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Создание питомца (с токеном)

```bash
curl -X POST http://localhost:5000/api/pet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Fluffy",
    "birthDate": "2020-01-15",
    "gender": "MALE"
  }'
```

---

## 🔧 Настройка переменных окружения

### Обязательные переменные

```env
DATABASE_URL=postgresql://user:password@localhost:5432/petcare
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
```

### Опциональные переменные

```env
NODE_ENV=development
PORT=5000
API_PREFIX=api
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

## 🐛 Решение проблем

### Ошибка подключения к базе данных

1. Проверьте, что PostgreSQL запущен
2. Убедитесь, что `DATABASE_URL` правильный
3. Проверьте права доступа пользователя БД

### Ошибка валидации переменных окружения

Приложение проверяет переменные окружения при старте. Убедитесь, что:
- Все обязательные переменные установлены
- `JWT_SECRET` имеет минимум 32 символа
- `DATABASE_URL` имеет правильный формат

### Ошибки миграций Prisma

```bash
# Сброс базы данных (ОСТОРОЖНО: удалит все данные!)
npx prisma migrate reset

# Или создайте новую миграцию
npx prisma migrate dev --name fix_migration
```

---

## 📚 Дополнительная документация

- [IMPROVEMENTS.md](./IMPROVEMENTS.md) - Детальный анализ и рекомендации
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Примеры использования компонентов
- [PRISMA_INDEXES.md](./PRISMA_INDEXES.md) - Рекомендации по индексам БД
- [README.md](./README.md) - Полная документация проекта

---

## 🎯 Следующие шаги

1. ✅ Настройте переменные окружения
2. ✅ Запустите миграции базы данных
3. ✅ Протестируйте API через Swagger
4. ✅ Добавьте индексы в Prisma (см. PRISMA_INDEXES.md)
5. ✅ Настройте CI/CD для автоматического деплоя

