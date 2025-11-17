import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Interceptor для установки таймаута на запросы
 * Защита от долгих запросов
 * 
 * @example
 * @UseInterceptors(new TimeoutInterceptor(5000)) // 5 секунд
 * @Get('slow-endpoint')
 * async slowOperation() {
 *   // Долгая операция
 * }
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  constructor(private readonly timeoutMs: number = 30000) {} // По умолчанию 30 секунд

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError((err) => {
        if (err instanceof TimeoutError) {
          return throwError(
            () => new RequestTimeoutException(`Request timeout after ${this.timeoutMs}ms`),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}

