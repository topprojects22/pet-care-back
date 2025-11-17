import { registerAs } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

/**
 * Конфигурация кэширования
 */
export default registerAs('cache', () => ({
  // In-memory кэш (по умолчанию)
  ttl: parseInt(process.env.CACHE_TTL || '300', 10), // 5 минут
  max: parseInt(process.env.CACHE_MAX || '100', 10), // Максимум 100 элементов

  // Redis кэш (если используется)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    ttl: parseInt(process.env.REDIS_TTL || '3600', 10), // 1 час
  },

  // Использовать Redis или in-memory
  useRedis: process.env.USE_REDIS === 'true',
}));

