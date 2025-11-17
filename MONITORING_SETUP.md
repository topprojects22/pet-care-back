# 📊 Настройка мониторинга и логирования

## 🎯 Обзор

Проект включает полную инфраструктуру для мониторинга:
- **Кэширование** - Redis или in-memory
- **Логирование** - Winston с ротацией файлов
- **Метрики** - Prometheus метрики
- **Трейсинг** - Request ID для отслеживания запросов

---

## 💾 Кэширование

### Настройка Redis

1. **Установите Redis:**

```bash
# Docker
docker run -d -p 6379:6379 redis:7-alpine

# Или через docker-compose
docker-compose -f docker-compose.prod.yml up -d redis
```

2. **Настройте переменные окружения:**

```env
USE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_TTL=3600
```

3. **Используйте в коде:**

```typescript
import { CacheService } from '../common/cache/cache.service';

@Injectable()
export class PetService {
  constructor(private readonly cacheService: CacheService) {}

  async findOne(id: number) {
    return this.cacheService.getOrSet(
      `pet:${id}`,
      async () => {
        return this.prisma.pet.findUnique({ where: { id } });
      },
      3600, // TTL 1 час
    );
  }
}
```

### Автоматическое кэширование

```typescript
import { CacheKeyPrefix, Cache } from '../common/decorators/cache-key.decorator';
import { CacheManagerInterceptor } from '../common/interceptors/cache-manager.interceptor';
import { UseInterceptors } from '@nestjs/common';

@Controller('pets')
@UseInterceptors(CacheManagerInterceptor)
export class PetController {
  @Get(':id')
  @CacheKeyPrefix('pet')
  @Cache(3600) // 1 час
  async findOne(@Param('id') id: number) {
    return this.petService.findOne(id);
  }
}
```

---

## 📝 Логирование

### Настройка Winston

1. **Включите файловое логирование:**

```env
ENABLE_FILE_LOGGING=true
LOG_DIRECTORY=./logs
LOG_LEVEL=info
LOG_FORMAT=json
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m
```

2. **Используйте в коде:**

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class PetService {
  private readonly logger = new Logger(PetService.name);

  async createPet(data: CreatePetDto) {
    this.logger.log('Creating pet', { name: data.name });
    
    try {
      const pet = await this.prisma.pet.create({ data });
      this.logger.log('Pet created', { petId: pet.id });
      return pet;
    } catch (error) {
      this.logger.error('Failed to create pet', error.stack, { data });
      throw error;
    }
  }
}
```

### Форматы логов

#### JSON (production)
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "level": "info",
  "context": "PetService",
  "message": "Pet created",
  "petId": 123
}
```

#### Simple (development)
```
2024-01-01 00:00:00 INFO [PetService] Pet created {"petId":123}
```

### Ротация логов

Логи автоматически ротируются:
- По дням: `application-2024-01-01.log`
- По размеру: при достижении 20MB
- Автоудаление: старые файлы удаляются через 14 дней

---

## 📊 Метрики Prometheus

### Endpoint

```
GET /metrics
```

### Доступные метрики

#### HTTP метрики
- `http_request_duration_seconds` - длительность запросов
- `http_requests_total` - общее количество запросов
- `http_requests_errors_total` - количество ошибок

#### Бизнес метрики
- `database_query_duration_seconds` - длительность запросов к БД
- `cache_hits_total` - попадания в кэш
- `cache_misses_total` - промахи кэша

#### Системные метрики
- `active_connections` - активные соединения
- `queue_size` - размер очереди

### Настройка Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'pet-care-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 15s
```

### Grafana дашборды

#### Запросы для дашбордов

```promql
# Средняя длительность HTTP запросов
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Количество запросов в секунду
rate(http_requests_total[1m])

# Процент ошибок
rate(http_requests_errors_total[5m]) / rate(http_requests_total[5m]) * 100

# Hit rate кэша
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) * 100

# Средняя длительность запросов к БД
rate(database_query_duration_seconds_sum[5m]) / rate(database_query_duration_seconds_count[5m])
```

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

---

## 🔍 Трейсинг запросов

### Request ID

Каждый запрос получает уникальный ID для трейсинга:

```typescript
// Request ID автоматически добавляется в заголовок X-Request-Id
// Используйте его в логах для отслеживания запросов

@Injectable()
export class PetService {
  private readonly logger = new Logger(PetService.name);

  async findOne(id: number, requestId?: string) {
    this.logger.log(`[${requestId}] Finding pet ${id}`);
    // ...
  }
}
```

---

## 🚨 Алерты

### Примеры алертов Prometheus

```yaml
groups:
  - name: pet-care-alerts
    rules:
      # Высокий процент ошибок
      - alert: HighErrorRate
        expr: rate(http_requests_errors_total[5m]) / rate(http_requests_total[5m]) > 0.1
        for: 5m
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      # Медленные запросы
      - alert: SlowRequests
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        annotations:
          summary: "Slow requests detected"
          description: "95th percentile is {{ $value }}s"
      
      # Медленные запросы к БД
      - alert: SlowDatabaseQueries
        expr: histogram_quantile(0.95, rate(database_query_duration_seconds_bucket[5m])) > 1
        for: 5m
        annotations:
          summary: "Slow database queries"
          description: "95th percentile is {{ $value }}s"
      
      # Низкий hit rate кэша
      - alert: LowCacheHitRate
        expr: rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) < 0.5
        for: 10m
        annotations:
          summary: "Low cache hit rate"
          description: "Hit rate is {{ $value | humanizePercentage }}"
```

---

## 📈 Дашборды Grafana

### Рекомендуемые панели

1. **HTTP метрики**
   - Requests per second
   - Error rate
   - Response time (p50, p95, p99)
   - Status code distribution

2. **Бизнес метрики**
   - Database query duration
   - Cache hit rate
   - Active connections

3. **Системные метрики**
   - CPU usage
   - Memory usage
   - Request queue size

---

## 🔧 Production настройки

### 1. Включить все компоненты

```env
# Кэширование
USE_REDIS=true
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-password

# Логирование
ENABLE_FILE_LOGGING=true
LOG_LEVEL=info
LOG_FORMAT=json

# Метрики
METRICS_ENABLED=true
METRICS_PATH=/metrics
```

### 2. Настроить мониторинг

- Установить Prometheus
- Настроить Grafana
- Настроить алерты
- Настроить сбор логов (Loki, ELK)

### 3. Настроить алерты

- Email уведомления
- Slack интеграция
- PagerDuty для критичных алертов

---

## 📚 Дополнительные ресурсы

- [INFRASTRUCTURE.md](./INFRASTRUCTURE.md) - Полное руководство по инфраструктуре
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Руководство по развертыванию
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Примеры использования

