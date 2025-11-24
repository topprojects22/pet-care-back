/**
 * Утилиты для форматирования ответов API
 */

/**
 * Создает стандартизированный успешный ответ
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    data,
    ...(message && { message }),
  };
}

/**
 * Создает стандартизированный ответ с пагинацией
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
) {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

/**
 * Форматирует имя пользователя (name + lastName)
 */
export function formatUserName(name?: string | null, lastName?: string | null): string {
  return `${name || ''} ${lastName || ''}`.trim() || 'User';
}
