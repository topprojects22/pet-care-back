/**
 * Утилиты для работы с пагинацией
 */

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * Создает метаданные пагинации
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasMore: page < totalPages,
  };
}

/**
 * Вычисляет skip для пагинации
 */
export function calculateSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Нормализует параметры пагинации
 */
export function normalizePaginationParams(
  page?: number | string,
  limit?: number | string,
  defaultPage = 1,
  defaultLimit = 20,
): { page: number; limit: number } {
  return {
    page: page ? (typeof page === 'string' ? +page : page) : defaultPage,
    limit: limit ? (typeof limit === 'string' ? +limit : limit) : defaultLimit,
  };
}

