import { registerAs } from '@nestjs/config';

/**
 * Конфигурация приложения
 * Централизованное управление настройками
 */
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || 'api',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
    connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10),
    poolTimeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '20', 10),
  },
  app: {
    name: process.env.APP_NAME || 'pet-care-backend',
  },
}));

