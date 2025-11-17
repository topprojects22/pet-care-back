/**
 * Утилиты для построения запросов к базе данных
 */

export interface FilterOptions {
  [key: string]: unknown;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  filters?: FilterOptions;
  sort?: SortOptions;
  search?: string;
  searchFields?: string[];
}

/**
 * Строит объект where для Prisma запросов
 */
export function buildWhereClause(
  filters?: FilterOptions,
  search?: string,
  searchFields?: string[],
): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  // Применяем фильтры
  if (filters) {
    Object.assign(where, filters);
  }

  // Применяем поиск
  if (search && searchFields && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: {
        contains: search,
        mode: 'insensitive' as const,
      },
    }));
  }

  return where;
}

/**
 * Строит объект orderBy для Prisma запросов
 */
export function buildOrderByClause(
  sort?: SortOptions,
  defaultSort: SortOptions = { field: 'createdAt', order: 'desc' },
): Record<string, string> {
  const sortOption = sort || defaultSort;
  return {
    [sortOption.field]: sortOption.order,
  };
}

/**
 * Вычисляет skip для пагинации
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Строит полный объект запроса для Prisma
 */
export function buildPrismaQuery(options: QueryOptions) {
  const { page = 1, limit = 10, filters, sort, search, searchFields } = options;

  return {
    where: buildWhereClause(filters, search, searchFields),
    orderBy: buildOrderByClause(sort),
    skip: calculateSkip(page, limit),
    take: limit,
  };
}

