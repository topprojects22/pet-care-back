// Упрощенная версия без DOMPurify для серверной стороны
// В production рекомендуется использовать полноценную библиотеку

/**
 * Утилиты для очистки и санитизации пользовательского ввода
 * Защита от XSS атак
 */

/**
 * Очищает HTML контент от потенциально опасных элементов
 * 
 * @param html - HTML строка для очистки
 * @returns Очищенная HTML строка
 * 
 * @note Для production рекомендуется использовать DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Базовая очистка - удаление скриптов и опасных тегов
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/**
 * Очищает обычный текст от потенциально опасных символов
 * 
 * @param text - Текст для очистки
 * @returns Очищенный текст
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Удаляем угловые скобки
    .replace(/javascript:/gi, '') // Удаляем javascript: протокол
    .replace(/on\w+=/gi, '') // Удаляем обработчики событий
    .trim();
}

/**
 * Валидация и очистка URL
 * 
 * @param url - URL для проверки
 * @returns Валидный URL или null
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    // Разрешаем только http и https протоколы
    if (['http:', 'https:'].includes(parsedUrl.protocol)) {
      return parsedUrl.toString();
    }
    return null;
  } catch {
    return null;
  }
}

