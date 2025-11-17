import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

/**
 * Конфигурация Winston логгера
 */
export const createWinstonConfig = (
  configService: ConfigService,
): WinstonModuleOptions => {
  const level = configService.get<string>('logger.level', 'info');
  const format = configService.get<string>('logger.format', 'json');
  const enableFileLogging = configService.get<boolean>(
    'logger.enableFileLogging',
    false,
  );
  const logDirectory = configService.get<string>('logger.logDirectory', './logs');
  const maxFiles = configService.get<string>('logger.maxFiles', '14d');
  const maxSize = configService.get<string>('logger.maxSize', '20m');
  const datePattern = configService.get<string>(
    'logger.datePattern',
    'YYYY-MM-DD',
  );

  const isDevelopment = configService.get<string>('app.nodeEnv') === 'development';

  // Формат логов
  const logFormat = format === 'json' 
    ? winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      )
    : winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, context, ...meta }) => {
            const contextStr = context ? `[${context}]` : '';
            const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} ${level} ${contextStr} ${message} ${metaStr}`;
          },
        ),
      );

  const transports: winston.transport[] = [
    // Консольный вывод
    new winston.transports.Console({
      level: isDevelopment ? 'debug' : level,
      format: logFormat,
    }),
  ];

  // Файловое логирование (если включено)
  if (enableFileLogging) {
    // Общий лог
    transports.push(
      new DailyRotateFile({
        filename: `${logDirectory}/application-%DATE%.log`,
        datePattern,
        maxSize,
        maxFiles,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    );

    // Лог ошибок
    transports.push(
      new DailyRotateFile({
        filename: `${logDirectory}/error-%DATE%.log`,
        datePattern,
        level: 'error',
        maxSize,
        maxFiles,
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json(),
        ),
      }),
    );
  }

  return {
    transports,
    level,
  };
};

