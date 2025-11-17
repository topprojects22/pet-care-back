import { SetMetadata } from '@nestjs/common';

export const CACHE_TTL_KEY = 'cache_ttl';

/**
 * Декоратор для указания времени жизни кэша в секундах
 * 
 * @example
 * @Get(':id')
 * @Cache(60) // Кэш на 60 секунд
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
export const Cache = (ttl: number) => SetMetadata(CACHE_TTL_KEY, ttl);

