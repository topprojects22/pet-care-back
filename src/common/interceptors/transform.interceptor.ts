import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Интерцептор для стандартизации формата успешных ответов
 * Обертывает все успешные ответы в единый формат
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        // Если ответ уже имеет стандартный формат, возвращаем как есть
        if (data && typeof data === 'object' && 'statusCode' in data) {
          return data;
        }

        // Обертываем в стандартный формат
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}

