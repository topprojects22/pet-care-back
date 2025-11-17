import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';

/**
 * Простой in-memory кэш interceptor
 * Для production рекомендуется использовать Redis
 * 
 * @example
 * @Get(':id')
 * @Cache(60) // Кэш на 60 секунд
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private cache = new Map<string, { data: unknown; expiresAt: number }>();
  private readonly defaultTtl: number;

  constructor(
    private reflector: Reflector,
    defaultTtl: number = 300, // 5 минут по умолчанию
  ) {
    this.defaultTtl = defaultTtl;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.getCacheKey(request);
    const cached = this.cache.get(cacheKey);

    // Проверяем кэш
    if (cached && cached.expiresAt > Date.now()) {
      return of(cached.data);
    }

    // Выполняем запрос и кэшируем результат
    return next.handle().pipe(
      tap((data) => {
        const ttl = this.getTtl(context) || this.defaultTtl;
        this.cache.set(cacheKey, {
          data,
          expiresAt: Date.now() + ttl * 1000,
        });

        // Очистка устаревших записей
        this.cleanExpired();
      }),
    );
  }

  private getCacheKey(request: any): string {
    return `${request.method}:${request.url}`;
  }

  private getTtl(context: ExecutionContext): number | null {
    // Можно добавить декоратор @Cache(seconds) для настройки TTL
    return null;
  }

  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (value.expiresAt <= now) {
        this.cache.delete(key);
      }
    }
  }
}

