import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Получаем конфигурацию
  const port = configService.get<number>('app.port', 5000);
  const apiPrefix = configService.get<string>('app.apiPrefix', 'api');
  const nodeEnv = configService.get<string>('app.nodeEnv', 'development');

  // Настройка Prisma shutdown hooks
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Статические файлы
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Безопасность: Helmet
  app.use(helmet());

  // CORS
  const corsOptions = configService.get('app.cors');
  app.enableCors(corsOptions);

  // Глобальный префикс API
  app.setGlobalPrefix(apiPrefix);

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, которых нет в DTO
      forbidNonWhitelisted: true, // Выбрасывает ошибку, если есть лишние свойства
      transform: true, // Автоматически преобразует типы
      transformOptions: {
        enableImplicitConversion: true, // Позволяет неявное преобразование типов
      },
      disableErrorMessages: nodeEnv === 'production', // Скрывает детали ошибок в продакшене
    }),
  );

  // Глобальные фильтры исключений
  app.useGlobalFilters(
    new PrismaExceptionFilter(), // Обработка ошибок Prisma
    new HttpExceptionFilter(), // Обработка всех остальных ошибок
  );

  // Глобальный интерцептор для стандартизации ответов
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger документация (только в development)
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Pet Care API')
      .setDescription('API для управления уходом за домашними животными')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', 'Аутентификация и авторизация')
      .addTag('Pets', 'Управление питомцами')
      .addTag('Health', 'Проверка состояния')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
    logger.log(`📚 Swagger docs available at: http://localhost:${port}/${apiPrefix}/docs`);
  }

  // Запуск приложения
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📝 Environment: ${nodeEnv}`);
}
bootstrap();
