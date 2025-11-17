import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

/**
 * Базовый сервис с общими методами
 * Предоставляет общие утилиты для всех сервисов
 */
@Injectable()
export abstract class BaseService {
  protected readonly logger: Logger;
  protected readonly prisma: PrismaService;

  constructor(prisma: PrismaService, serviceName: string) {
    this.prisma = prisma;
    this.logger = new Logger(serviceName);
  }

  /**
   * Логирование ошибок с контекстом
   */
  protected logError(error: Error, context?: Record<string, unknown>): void {
    this.logger.error(
      {
        message: error.message,
        stack: error.stack,
        ...context,
      },
      error.constructor.name,
    );
  }

  /**
   * Логирование предупреждений
   */
  protected logWarn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn({ message, ...context });
  }

  /**
   * Логирование информационных сообщений
   */
  protected logInfo(message: string, context?: Record<string, unknown>): void {
    this.logger.log({ message, ...context });
  }
}

