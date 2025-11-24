import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Interceptor для логирования HTTP запросов с Request ID
 */
@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const requestId = (request as Request & { requestId?: string }).requestId || 'unknown';
    const userAgent = headers['user-agent'] || 'unknown';

    const startTime = Date.now();

    this.logger.log(
      `[${requestId}] ${method} ${url} - ${ip} - ${userAgent}`,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const status = context.switchToHttp().getResponse().statusCode;
          this.logger.log(
            `[${requestId}] ${method} ${url} - ${status} - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const status = error.status || 500;
          this.logger.error(
            `[${requestId}] ${method} ${url} - ${status} - ${duration}ms - ${error.message}`,
            error.stack,
          );
        },
      }),
    );
  }
}

