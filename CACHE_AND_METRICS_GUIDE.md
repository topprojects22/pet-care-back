# 📊 Руководство по кэшированию, метрикам и логированию

## 💾 Кэширование

### Настройка

#### In-Memory (по умолчанию)
```env
USE_REDIS=false
CACHE_TTL=300
```

#### Redis (production)
```env
USE_REDIS=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_TTL=3600
```

### Использование

#### Автоматическое кэширование

```typescript
import { CacheKeyPrefix, Cache } from '../common/decorators/cache-key.decorator';
import { CacheDecoratorInterceptor } from '../common/interceptors/cache-decorator.interceptor';
import { UseInterceptors } from '@nestjs/common';

@Controller('pets')
@UseInterceptors(CacheDecoratorInterceptor)
export class PetController {
  @Get(':id')
  @CacheKeyPrefix('pet')
  @Cache(3600) // 1 час
  async findOne(@Param('id') id: number) {
    return this.petService.findOne(id);
  }
}
```

#### Ручное управление кэшем

```typescript
import { CacheService } from '../common/cache/cache.service';

@Injectable()
export class PetService {
  constructor(private readonly cacheService: CacheService) {}

  async findOne(id: number) {
    // Получить или установить
    return this.cacheService.getOrSet(
      `pet:${id}`,
      async () => {
        return this.prisma.pet.findUnique({ where: { id } });
      },
      3600, // TTL
    );
  }

  async invalidateCache(id: number) {
    await this.cacheService.del(`pet:${id}`);
  }
}
```

---

## 📝 Логирование

### Настройка

```env
LOG_LEVEL=info
LOG_FORMAT=json
ENABLE_FILE_LOGGING=true
LOG_DIRECTORY=./logs
LOG_MAX_FILES=14d
LOG_MAX_SIZE=20m
```

### Использование

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

### Request ID

Каждый запрос автоматически получает уникальный ID:

```typescript
// Request ID доступен в req['requestId']
// Используется для трейсинга запросов в логах
```

---

## 📊 Метрики

### Endpoint

```
GET /metrics
```

### Автоматические метрики

- HTTP запросы (длительность, количество, ошибки)
- Запросы к БД (автоматически через Prisma middleware)
- Кэш (hits/misses)

### Ручная запись метрик

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

### Prometheus запросы

```promql
# Средняя длительность HTTP запросов
rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])

# Количество запросов в секунду
rate(http_requests_total[1m])

# Hit rate кэша
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m])) * 100
```

---

## 🚀 Production настройки

### 1. Включить все компоненты

```env
USE_REDIS=true
ENABLE_FILE_LOGGING=true
METRICS_ENABLED=true
```

### 2. Настроить мониторинг

- Prometheus для сбора метрик
- Grafana для визуализации
- Loki/ELK для логов

### 3. Настроить алерты

См. [MONITORING_SETUP.md](./MONITORING_SETUP.md)

---

Для полной документации см. [INFRASTRUCTURE.md](./INFRASTRUCTURE.md)

