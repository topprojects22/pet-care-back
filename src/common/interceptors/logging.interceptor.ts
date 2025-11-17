import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor для логирования выполнения методов
 * Логирует входные параметры и результат выполнения
 * 
 * @example
 * @UseInterceptors(LoggingInterceptor)
 * @Get(':id')
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, params, query } = request;
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;

    const startTime = Date.now();

    this.logger.debug(
      `→ ${className}.${handlerName}() - ${method} ${url}`,
      {
        params,
        query,
        body: this.sanitizeBody(body),
      },
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.debug(
            `← ${className}.${handlerName}() - ${duration}ms`,
            {
              responseSize: JSON.stringify(data).length,
            },
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `✗ ${className}.${handlerName}() - ${duration}ms - ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }

  private sanitizeBody(body: unknown): unknown {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...(body as Record<string, unknown>) };
    // Удаляем чувствительные данные из логов
    if ('password' in sanitized) {
      sanitized.password = '***';
    }
    if ('token' in sanitized) {
      sanitized.token = '***';
    }
    return sanitized;
  }
}

