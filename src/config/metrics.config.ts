import { registerAs } from '@nestjs/config';

/**
 * Конфигурация метрик
 */
export default registerAs('metrics', () => ({
  enabled: process.env.METRICS_ENABLED === 'true' || true,
  path: process.env.METRICS_PATH || '/metrics',
  port: parseInt(process.env.METRICS_PORT || '9090', 10),
  defaultLabels: {
    app: process.env.APP_NAME || 'pet-care-backend',
    environment: process.env.NODE_ENV || 'development',
  },
}));

