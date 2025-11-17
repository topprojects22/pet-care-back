import { ValidationError } from 'class-validator';

/**
 * Форматирует ошибки валидации в читаемый формат
 */
export function formatValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  errors.forEach((error) => {
    const field = error.property;
    const messages: string[] = [];

    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    // Рекурсивно обрабатываем вложенные ошибки
    if (error.children && error.children.length > 0) {
      const nestedErrors = formatValidationErrors(error.children);
      Object.keys(nestedErrors).forEach((nestedField) => {
        formatted[`${field}.${nestedField}`] = nestedErrors[nestedField];
      });
    }

    if (messages.length > 0) {
      formatted[field] = messages;
    }
  });

  return formatted;
}

/**
 * Извлекает сообщения об ошибках из ValidationError
 */
export function extractErrorMessages(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  errors.forEach((error) => {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children && error.children.length > 0) {
      messages.push(...extractErrorMessages(error.children));
    }
  });

  return messages;
}

