/**
 * Утилиты для работы с типами
 */

/**
 * Проверяет, является ли значение объектом (не null и не массив)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Проверяет, является ли значение массивом
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Проверяет, является ли значение строкой
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Проверяет, является ли значение числом
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Проверяет, является ли значение boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Проверяет, является ли значение функцией
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Проверяет, является ли значение null или undefined
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Проверяет, является ли значение пустым (null, undefined, пустая строка, пустой массив, пустой объект)
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (isObject(value)) return Object.keys(value).length === 0;
  return false;
}

/**
 * Безопасно получает значение из объекта по пути
 */
export function get(
  obj: Record<string, unknown>,
  path: string,
  defaultValue?: unknown,
): unknown {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    if (isObject(result)) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }

  return result === undefined ? defaultValue : result;
}

/**
 * Безопасно устанавливает значение в объект по пути
 */
export function set(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  let current: Record<string, unknown> = obj;

  for (const key of keys) {
    if (!isObject(current[key])) {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  current[lastKey] = value;
}

