import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Сервис для работы с кэшем
 * Поддерживает как in-memory, так и Redis кэш
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Получить значение из кэша
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Failed to get cache key: ${key}`, error);
      return undefined;
    }
  }

  /**
   * Установить значение в кэш
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Failed to set cache key: ${key}`, error);
    }
  }

  /**
   * Удалить значение из кэша
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete cache key: ${key}`, error);
    }
  }

  /**
   * Очистить весь кэш
   */
  async reset(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      this.logger.error('Failed to reset cache', error);
    }
  }

  /**
   * Получить или установить значение (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Инвалидировать кэш по паттерну (для Redis)
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Для Redis можно использовать SCAN для поиска ключей по паттерну
      // Для in-memory кэша это не поддерживается
      if (this.cacheManager.store?.name === 'redis') {
        // Реализация для Redis
        this.logger.warn('Pattern invalidation requires custom Redis implementation');
      }
    } catch (error) {
      this.logger.error(`Failed to invalidate pattern: ${pattern}`, error);
    }
  }
}

