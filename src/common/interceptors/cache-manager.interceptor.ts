import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_PREFIX, CACHE_TTL_KEY } from '../decorators/cache-key.decorator';
import { Request } from 'express';

/**
 * Interceptor для автоматического кэширования ответов
 * Использует декораторы @CacheKeyPrefix и @Cache для настройки
 */
@Injectable()
export class CacheManagerInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, params, query } = request;

    // Кэшируем только GET запросы
    if (method !== 'GET') {
      return next.handle();
    }

    const prefix = this.reflector.get<string>(
      CACHE_KEY_PREFIX,
      context.getHandler(),
    );
    const ttl = this.reflector.get<number>(CACHE_TTL_KEY, context.getHandler());

    if (!prefix) {
      return next.handle();
    }

    // Строим ключ кэша
    const cacheKey = this.buildCacheKey(prefix, params, query);

    // Пытаемся получить из кэша
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    // Выполняем запрос и кэшируем результат
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, ttl ? ttl * 1000 : undefined);
      }),
    );
  }

  private buildCacheKey(
    prefix: string,
    params: Record<string, unknown>,
    query: Record<string, unknown>,
  ): string {
    const parts = [prefix];
    
    // Добавляем параметры
    Object.keys(params)
      .sort()
      .forEach((key) => {
        parts.push(`${key}:${params[key]}`);
      });

    // Добавляем query параметры
    Object.keys(query)
      .sort()
      .forEach((key) => {
        parts.push(`${key}:${query[key]}`);
      });

    return parts.join(':');
  }
}

