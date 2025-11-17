import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

/**
 * Middleware для добавления уникального ID к каждому запросу
 * Полезно для трейсинга запросов в логах
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RequestIdMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    // Генерируем уникальный ID без внешних зависимостей
    const requestId = randomBytes(16).toString('hex');
    
    // Добавляем ID к запросу
    req['requestId'] = requestId;
    
    // Добавляем ID в заголовок ответа
    res.setHeader('X-Request-Id', requestId);
    
    // Добавляем ID в локальный контекст для логгера
    const originalLog = this.logger.log;
    this.logger['context'] = `[${requestId}]`;
    
    next();
  }
}

