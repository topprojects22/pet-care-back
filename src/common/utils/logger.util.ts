import { Logger } from '@nestjs/common';

/**
 * Утилита для создания именованных логгеров
 * Обеспечивает единообразное логирование по всему приложению
 */
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};

/**
 * Форматирование логов для продакшена
 */
export const formatLogMessage = (
  message: string,
  context?: string,
  metadata?: Record<string, unknown>,
): string => {
  const parts = [message];
  
  if (context) {
    parts.push(`[${context}]`);
  }
  
  if (metadata && Object.keys(metadata).length > 0) {
    parts.push(JSON.stringify(metadata));
  }
  
  return parts.join(' ');
};

