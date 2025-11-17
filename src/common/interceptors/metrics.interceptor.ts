import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';
import { Request, Response } from 'express';

/**
 * Interceptor для автоматического сбора HTTP метрик
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, route } = request;
    const routePath = route?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const status = response.statusCode;
        this.metricsService.recordHttpRequest(method, routePath, status, duration);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const status = error.status || 500;
        const errorType = error.constructor?.name || 'UnknownError';
        
        this.metricsService.recordHttpRequest(method, routePath, status, duration);
        this.metricsService.recordHttpError(method, routePath, errorType);
        
        throw error;
      }),
    );
  }
}

