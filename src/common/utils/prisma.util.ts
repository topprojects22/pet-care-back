import { Prisma } from '@prisma/client';

/**
 * Утилиты для работы с Prisma
 */

/**
 * Создает объект для включения связанных данных
 */
export function createInclude<T extends Record<string, unknown>>(
  fields: (keyof T)[],
): Prisma.Enumerable<Prisma.UserInclude> {
  const include: Record<string, boolean> = {};
  fields.forEach((field) => {
    include[field as string] = true;
  });
  return include as Prisma.Enumerable<Prisma.UserInclude>;
}

/**
 * Создает объект для выбора полей
 */
export function createSelect<T extends Record<string, unknown>>(
  fields: (keyof T)[],
): Record<string, boolean> {
  const select: Record<string, boolean> = {};
  fields.forEach((field) => {
    select[field as string] = true;
  });
  return select;
}

/**
 * Строит условие для поиска по дате
 */
export function buildDateRangeFilter(
  field: string,
  startDate?: Date,
  endDate?: Date,
): Record<string, unknown> | undefined {
  if (!startDate && !endDate) return undefined;

  const filter: Record<string, unknown> = {};

  if (startDate) {
    filter.gte = startDate;
  }

  if (endDate) {
    filter.lte = endDate;
  }

  return { [field]: filter };
}

/**
 * Строит условие для поиска по числовому диапазону
 */
export function buildNumberRangeFilter(
  field: string,
  min?: number,
  max?: number,
): Record<string, unknown> | undefined {
  if (min === undefined && max === undefined) return undefined;

  const filter: Record<string, unknown> = {};

  if (min !== undefined) {
    filter.gte = min;
  }

  if (max !== undefined) {
    filter.lte = max;
  }

  return { [field]: filter };
}

/**
 * Строит условие для поиска в массиве
 */
export function buildArrayFilter(
  field: string,
  values: unknown[],
  mode: 'in' | 'notIn' = 'in',
): Record<string, unknown> | undefined {
  if (!values || values.length === 0) return undefined;

  return {
    [field]: {
      [mode]: values,
    },
  };
}

