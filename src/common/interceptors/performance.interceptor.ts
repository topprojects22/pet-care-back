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
 * Interceptor для измерения производительности запросов
 * Логирует время выполнения каждого запроса
 * 
 * @example
 * @UseInterceptors(PerformanceInterceptor)
 * @Get(':id')
 * async findOne(@Param('id') id: number) {
 *   return this.service.findOne(id);
 * }
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = performance.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = performance.now() - startTime;
          const durationMs = duration.toFixed(2);
          
          if (duration > 1000) {
            this.logger.warn(`Slow request: ${method} ${url} - ${durationMs}ms`);
          } else {
            this.logger.debug(`${method} ${url} - ${durationMs}ms`);
          }
        },
        error: () => {
          const duration = performance.now() - startTime;
          this.logger.error(
            `Failed request: ${method} ${url} - ${duration.toFixed(2)}ms`,
          );
        },
      }),
    );
  }
}

