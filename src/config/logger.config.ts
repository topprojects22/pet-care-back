import { registerAs } from '@nestjs/config';

/**
 * Конфигурация логирования
 */
export default registerAs('logger', () => ({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'json', // json или simple
  enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
  logDirectory: process.env.LOG_DIRECTORY || './logs',
  maxFiles: process.env.LOG_MAX_FILES || '14d', // Хранить логи 14 дней
  maxSize: process.env.LOG_MAX_SIZE || '20m', // Максимальный размер файла
  datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
}));

