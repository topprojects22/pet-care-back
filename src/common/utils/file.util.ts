import { extname } from 'path';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../constants';

/**
 * Утилиты для работы с файлами
 */

/**
 * Проверяет, является ли файл изображением
 */
export function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const ext = extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

/**
 * Проверяет размер файла
 */
export function isValidFileSize(size: number, maxSize: number = MAX_FILE_SIZE): boolean {
  return size <= maxSize;
}

/**
 * Проверяет MIME тип файла
 */
export function isValidMimeType(
  mimeType: string,
  allowedTypes: string[] = ALLOWED_FILE_TYPES,
): boolean {
  return allowedTypes.includes(mimeType);
}

/**
 * Получает расширение файла
 */
export function getFileExtension(filename: string): string {
  return extname(filename).toLowerCase().slice(1);
}

/**
 * Генерирует уникальное имя файла
 */
export function generateFileName(originalName: string, prefix?: string): string {
  const ext = extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const name = prefix ? `${prefix}-${timestamp}-${random}${ext}` : `${timestamp}-${random}${ext}`;
  return name;
}

/**
 * Валидирует файл
 */
export function validateFile(
  file: Express.Multer.File,
  options?: {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
  },
): { valid: boolean; error?: string } {
  const {
    maxSize = MAX_FILE_SIZE,
    allowedTypes = ALLOWED_FILE_TYPES,
    allowedExtensions,
  } = options || {};

  // Проверка размера
  if (!isValidFileSize(file.size, maxSize)) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Проверка MIME типа
  if (!isValidMimeType(file.mimetype, allowedTypes)) {
    return {
      valid: false,
      error: `File type ${file.mimetype} is not allowed`,
    };
  }

  // Проверка расширения (если указано)
  if (allowedExtensions && allowedExtensions.length > 0) {
    const ext = getFileExtension(file.originalname);
    if (!allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `File extension .${ext} is not allowed`,
      };
    }
  }

  return { valid: true };
}

