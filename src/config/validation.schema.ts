import * as Joi from 'joi';

/**
 * Схема валидации переменных окружения
 * Используется для проверки наличия и корректности всех необходимых переменных
 */
export const validationSchema = Joi.object({
  // App
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  API_PREFIX: Joi.string().default('api'),

  // Database
  DATABASE_URL: Joi.string().required(),

  // JWT
  JWT_SECRET: Joi.string()
    .required()
    .min(32)
    .messages({
      'string.min': 'JWT_SECRET must be at least 32 characters long. Generate one with: openssl rand -base64 32',
      'any.required': 'JWT_SECRET is required',
    }),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // CORS
  CORS_ORIGIN: Joi.string().optional(),

  // Rate Limiting
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  // Cache
  USE_REDIS: Joi.boolean().default(false),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),
  CACHE_TTL: Joi.number().default(300),
  REDIS_TTL: Joi.number().default(3600),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug', 'verbose').default('info'),
  LOG_FORMAT: Joi.string().valid('json', 'simple').default('json'),
  ENABLE_FILE_LOGGING: Joi.boolean().default(false),
  LOG_DIRECTORY: Joi.string().default('./logs'),
  LOG_MAX_FILES: Joi.string().default('14d'),
  LOG_MAX_SIZE: Joi.string().default('20m'),

  // Metrics
  METRICS_ENABLED: Joi.boolean().default(true),
  METRICS_PATH: Joi.string().default('/metrics'),
  METRICS_PORT: Joi.number().default(9090),

  // Mailer
  MAILER_HOST: Joi.string().default('smtp.gmail.com'),
  MAILER_PORT: Joi.number().default(587),
  MAILER_SECURE: Joi.boolean().default(false),
  MAILER_USER: Joi.string().optional(),
  MAILER_PASSWORD: Joi.string().optional(),
  MAILER_FROM: Joi.string().optional(),
  APP_URL: Joi.string().default('http://localhost:5000'),

  // Apple App Store
  APP_STORE_SERVER_URL: Joi.string()
    .default('https://api.storekit.itunes.apple.com')
    .description('Apple App Store Server API URL'),
  APP_STORE_KEY_ID: Joi.string().optional().description('Apple App Store Key ID'),
  APP_STORE_ISSUER_ID: Joi.string().optional().description('Apple App Store Issuer ID'),
  APP_STORE_BUNDLE_ID: Joi.string().optional().description('Apple App Store Bundle ID'),
  APP_STORE_PRIVATE_KEY: Joi.string()
    .optional()
    .description('Apple App Store Private Key (base64 encoded)'),

  // Google OAuth (опционально)
  GOOGLE_CLIENT_ID: Joi.string().optional().description('Google OAuth Client ID'),

  // Apple OAuth (опционально)
  APPLE_CLIENT_ID: Joi.string().optional().description('Apple OAuth Client ID'),
  APPLE_TEAM_ID: Joi.string().optional().description('Apple OAuth Team ID'),

  // Database Connection Pooling
  DATABASE_CONNECTION_LIMIT: Joi.number().default(10).description('Database connection pool limit'),
  DATABASE_POOL_TIMEOUT: Joi.number().default(20).description('Database connection pool timeout in seconds'),
});

