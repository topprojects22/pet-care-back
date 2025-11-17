import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';
import { PrismaService } from '../../prisma.service';

/**
 * Interceptor для отслеживания запросов к базе данных
 * Использует Prisma middleware для автоматического сбора метрик
 */
@Injectable()
export class DatabaseMetricsInterceptor implements NestInterceptor {
  private initialized = false;

  constructor(
    private readonly metricsService: MetricsService,
    @Inject('PrismaService') private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.initialized) {
      this.setupPrismaMiddleware();
      this.initialized = true;
    }
    return next.handle();
  }

  private setupPrismaMiddleware(): void {
    this.prisma.$use(async (params, next) => {
      const start = Date.now();
      const operation = params.action;
      const model = params.model || 'unknown';

      try {
        const result = await next(params);
        const duration = Date.now() - start;

        this.metricsService.recordDatabaseQuery(operation, model, duration);

        return result;
      } catch (error) {
        const duration = Date.now() - start;
        this.metricsService.recordDatabaseQuery(operation, model, duration);
        throw error;
      }
    });
  }
}

