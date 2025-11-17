/**
 * Утилиты для работы с переменными окружения
 */

/**
 * Получает переменную окружения или возвращает значение по умолчанию
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  return value;
}

/**
 * Получает переменную окружения как число
 */
export function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${key} is not a valid number`);
  }
  return num;
}

/**
 * Получает переменную окружения как boolean
 */
export function getEnvBoolean(key: string, defaultValue?: boolean): boolean {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Получает переменную окружения как массив (разделенный запятыми)
 */
export function getEnvArray(key: string, defaultValue?: string[]): string[] {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  return value.split(',').map((item) => item.trim());
}

/**
 * Проверяет, установлена ли переменная окружения
 */
export function hasEnv(key: string): boolean {
  return process.env[key] !== undefined;
}

/**
 * Проверяет, является ли текущее окружение production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Проверяет, является ли текущее окружение development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

/**
 * Проверяет, является ли текущее окружение test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}

