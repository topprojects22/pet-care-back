import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Базовый класс для бизнес-исключений
 * Используется для ошибок бизнес-логики (не технических)
 */
export class BusinessException extends HttpException {
  constructor(
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(
      {
        message,
        code,
        details,
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

/**
 * Исключение для ресурсов, которые не найдены
 */
export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, id?: number | string) {
    super(
      `${resource}${id ? ` with id ${id}` : ''} not found`,
      HttpStatus.NOT_FOUND,
      'RESOURCE_NOT_FOUND',
      { resource, id },
    );
  }
}

/**
 * Исключение для конфликтов (например, дублирование ресурса)
 */
export class ConflictException extends BusinessException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.CONFLICT, 'CONFLICT', details);
  }
}

/**
 * Исключение для валидации бизнес-правил
 */
export class ValidationException extends BusinessException {
  constructor(message: string, details?: unknown) {
    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR', details);
  }
}

/**
 * Исключение для доступа запрещен
 */
export class ForbiddenResourceException extends BusinessException {
  constructor(resource?: string) {
    super(
      `Access to ${resource || 'resource'} is forbidden`,
      HttpStatus.FORBIDDEN,
      'FORBIDDEN',
      { resource },
    );
  }
}

