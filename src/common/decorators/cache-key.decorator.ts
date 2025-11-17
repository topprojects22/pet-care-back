import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_PREFIX = 'cache_key_prefix';
export const CACHE_TTL_KEY = 'cache_ttl';

/**
 * Декоратор для указания префикса ключа кэша
 * 
 * @example
 * @CacheKeyPrefix('user')
 * @Get(':id')
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
export const CacheKeyPrefix = (prefix: string) =>
  SetMetadata(CACHE_KEY_PREFIX, prefix);

/**
 * Декоратор для указания времени жизни кэша в секундах
 * 
 * @example
 * @Cache(3600) // 1 час
 * @Get(':id')
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
export const Cache = (ttl: number) => SetMetadata(CACHE_TTL_KEY, ttl);

