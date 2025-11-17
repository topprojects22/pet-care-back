# 📜 Скрипты проекта

## Быстрый старт

```bash
# Первоначальная настройка
./scripts/setup.sh

# Проверка окружения
./scripts/check-env.sh

# Заполнение базы данных
npm run seed
```

## Все скрипты

- `setup.sh` - Первоначальная настройка
- `check-env.sh` - Проверка окружения
- `deploy.sh` - Деплой через Docker
- `k8s-deploy.sh` - Деплой в Kubernetes
- `backup-db.sh` - Резервное копирование БД
- `restore-db.sh` - Восстановление БД
- `migrate-db.sh` - Применение миграций
- `generate-ssl.sh` - Генерация SSL сертификатов
- `clean.sh` - Очистка проекта

Подробная документация: [scripts.md](./scripts.md)

