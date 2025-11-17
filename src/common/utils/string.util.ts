/**
 * Утилиты для работы со строками
 */

/**
 * Обрезает строку до указанной длины с добавлением многоточия
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) {
    return str;
  }
  return str.slice(0, length - 3) + '...';
}

/**
 * Преобразует строку в slug (URL-friendly)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Капитализирует первую букву строки
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Капитализирует каждое слово в строке
 */
export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

/**
 * Маскирует email (например: u***@example.com)
 */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const maskedLocal = localPart[0] + '*'.repeat(Math.min(localPart.length - 1, 3));
  return `${maskedLocal}@${domain}`;
}

/**
 * Маскирует телефон (например: +7 (***) ***-**45)
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 4) return phone;
  
  const last4 = cleaned.slice(-4);
  const masked = '*'.repeat(cleaned.length - 4);
  return `+${masked}${last4}`;
}

/**
 * Генерирует случайную строку заданной длины
 */
export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

