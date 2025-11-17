/**
 * Общие константы приложения
 * Централизованное хранение магических значений
 */

// Валидация паролей
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Пагинация
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// JWT
export const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
export const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';

// Rate Limiting
export const RATE_LIMIT_TTL = 60; // секунды
export const RATE_LIMIT_MAX = 100; // запросов

// Файлы
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Роли
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  VET: 'vet',
  SHELTER_OWNER: 'shelter_owner',
} as const;

// Статусы
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;

