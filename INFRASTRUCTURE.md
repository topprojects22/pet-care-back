# 🏗️ Руководство по инфраструктуре

## 📋 Содержание

1. [Кэширование](#кэширование)
2. [Логирование](#логирование)
3. [Метрики](#метрики)
4. [Docker Compose](#docker-compose)
5. [Kubernetes](#kubernetes)
6. [Мониторинг](#мониторинг)

---

## 💾 Кэширование

### Конфигурация

Проект поддерживает два типа кэширования:

1. **In-Memory кэш** (по умолчанию) - для разработки
2. **Redis кэш** - для production

### Переменные окружения

```env
# Использовать Redis
USE_REDIS=true

# Redis настройки
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
REDIS_TTL=3600

# In-Memory настройки
CACHE_TTL=300
CACHE_MAX=100
```

### Использование в коде

```typescript
import { CacheService } from '../common/cache/cache.service';
import { CacheKeyPrefix, Cache } from '../common/decorators/cache-key.decorator';

@Controller('pets')
export class PetController {
  constructor(private readonly cacheService: CacheService) {}

  // Автоматическое кэширование через interceptor
  @Get(':id')
  @CacheKeyPrefix('pet')
  @Cache(3600) // 1 час
  async findOne(@Param('id') id: number) {
    return this.petService.findOne(id);
  }

  // Ручное управление кэшем
  async getCachedData(key: string) {
    return this.cacheService.getOrSet(
      key,
      async () => {
        // Дорогая операция
        return await this.expensiveOperation();
      },
      3600, // TTL в секундах
    );
  }
}
```

### Стратегии кэширования

1. **Cache-Aside** - приложение управляет кэшем
2. **Write-Through** - запись в кэш и БД одновременно
3. **Write-Back** - запись сначала в кэш, потом в БД

---

## 📝 Логирование

### Конфигурация

Проект использует Winston для структурированного логирования.

### Переменные окружения

```env
# Уровень логирования
LOG_LEVEL=info # error, warn, info, debug, verbose

# Формат логов
LOG_FORMAT=json # json или simple

# Файловое логирование
ENABLE_FILE_LOGGING=true
LOG_DIRECTORY=./logs
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m
LOG_DATE_PATTERN=YYYY-MM-DD
```

### Использование в коде

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class PetService {
  private readonly logger = new Logger(PetService.name);

  async createPet(data: CreatePetDto) {
    this.logger.log('Creating pet', { name: data.name });
    
    try {
      const pet = await this.prisma.pet.create({ data });
      this.logger.log('Pet created successfully', { petId: pet.id });
      return pet;
    } catch (error) {
      this.logger.error('Failed to create pet', error.stack, { data });
      throw error;
    }
  }
}
```

### Форматы логов

#### JSON формат (production)
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "context": "PetService",
  "message": "Pet created successfully",
  "petId": 123
}
```

#### Simple формат (development)
```
2024-01-01 00:00:00 INFO [PetService] Pet created successfully {"petId":123}
```

### Ротация логов

Логи автоматически ротируются по дням:
- `application-2024-01-01.log`
- `error-2024-01-01.log`

Старые файлы удаляются автоматически (по умолчанию 14 дней).

---

## 📊 Метрики

### Prometheus метрики

Проект автоматически собирает метрики через Prometheus.

### Endpoint

```
GET /metrics
```

### Доступные метрики

#### HTTP метрики
- `http_request_duration_seconds` - длительность HTTP запросов
- `http_requests_total` - общее количество запросов
- `http_requests_errors_total` - количество ошибок

#### Бизнес метрики
- `database_query_duration_seconds` - длительность запросов к БД
- `cache_hits_total` - попадания в кэш
- `cache_misses_total` - промахи кэша

#### Системные метрики
- `active_connections` - активные соединения
- `queue_size` - размер очереди

### Использование в коде

```typescript
import { MetricsService } from '../common/metrics/metrics.service';

@Injectable()
export class PetService {
  constructor(private readonly metricsService: MetricsService) {}

  async findOne(id: number) {
    const start = Date.now();
    try {
      const pet = await this.prisma.pet.findUnique({ where: { id } });
      const duration = Date.now() - start;
      
      this.metricsService.recordDatabaseQuery('findUnique', 'pet', duration);
      return pet;
    } catch (error) {
      const duration = Date.now() - start;
      this.metricsService.recordDatabaseQuery('findUnique', 'pet', duration);
      throw error;
    }
  }
}
```

### Grafana дашборды

Пример запросов для Grafana:

```promql
# Средняя длительность HTTP запросов
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Количество ошибок в минуту
rate(http_requests_errors_total[1m])

# Hit rate кэша
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))
```

---

## 🐳 Docker Compose

### Development

```bash
docker-compose up -d
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Сервисы

- **app** - основное приложение
- **postgres** - база данных
- **redis** - кэш (только в production)

---

## ☸️ Kubernetes

### Развертывание

```bash
# Применить все манифесты
kubectl apply -f k8s/

# Проверить статус
kubectl get pods
kubectl get services
```

### Компоненты

1. **Deployment** - развертывание приложения
2. **Service** - сервис для доступа
3. **ConfigMap** - конфигурация
4. **HPA** - автоматическое масштабирование
5. **Redis Deployment** - развертывание Redis

### Масштабирование

HPA автоматически масштабирует приложение на основе:
- CPU использования (70%)
- Memory использования (80%)

Диапазон: 3-10 реплик

### Health Checks

- **Liveness Probe**: `/api/health/liveness`
- **Readiness Probe**: `/api/health/readiness`

---

## 📈 Мониторинг

### Prometheus

Настройка для сбора метрик:

```yaml
scrape_configs:
  - job_name: 'pet-care-backend'
    static_configs:
      - targets: ['pet-care-backend-service:9090']
```

### Grafana

Рекомендуемые дашборды:

1. **HTTP метрики** - запросы, ошибки, длительность
2. **Бизнес метрики** - операции БД, кэш
3. **Системные метрики** - CPU, Memory, Connections
4. **Логи** - интеграция с Loki

### Алерты

Примеры алертов:

```yaml
groups:
  - name: pet-care-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_errors_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High error rate detected"
      
      - alert: SlowDatabaseQueries
        expr: database_query_duration_seconds > 1
        for: 5m
        annotations:
          summary: "Slow database queries detected"
```

---

## 🔧 Настройка для production

### 1. Включить Redis

```env
USE_REDIS=true
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-password
```

### 2. Включить файловое логирование

```env
ENABLE_FILE_LOGGING=true
LOG_DIRECTORY=/app/logs
```

### 3. Настроить метрики

```env
METRICS_ENABLED=true
METRICS_PATH=/metrics
```

### 4. Настроить мониторинг

- Установить Prometheus
- Настроить Grafana
- Настроить алерты

---

## 📚 Дополнительные ресурсы

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Руководство по развертыванию
- [QUICK_START.md](./QUICK_START.md) - Быстрый старт
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Примеры использования

