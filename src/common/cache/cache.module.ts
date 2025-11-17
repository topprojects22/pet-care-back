import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';
import cacheConfig from '../../config/cache.config';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): any => {
        const useRedis = configService.get<boolean>('cache.useRedis', false);
        const cacheConfigValue = configService.get('cache');

        if (useRedis) {
          // Для Redis используем ioredis
          const Redis = require('ioredis');
          const redis = new Redis({
            host: cacheConfigValue.redis.host,
            port: cacheConfigValue.redis.port,
            password: cacheConfigValue.redis.password,
            db: cacheConfigValue.redis.db,
          });
          
          return {
            store: require('cache-manager-ioredis-yet'),
            redisInstance: redis,
            ttl: cacheConfigValue.redis.ttl * 1000, // Конвертируем в миллисекунды
          };
        }

        return {
          ttl: cacheConfigValue.ttl * 1000, // Конвертируем в миллисекунды
          max: cacheConfigValue.max,
        };
      },
    }),
    ConfigModule.forFeature(cacheConfig),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

