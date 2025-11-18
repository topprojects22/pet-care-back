/**
 * Скрипт для генерации Swagger JSON схемы
 * 
 * Использование:
 * npm run swagger:generate
 * 
 * Результат: swagger-schema.json в корне проекта
 */

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../src/app.module';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generateSwaggerSchema() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get('app.apiPrefix', 'api');

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
  
  const outputPath = join(process.cwd(), 'swagger-schema.json');
  writeFileSync(outputPath, JSON.stringify(document, null, 2));
  
  console.log('✅ Swagger schema generated successfully!');
  console.log(`📄 File location: ${outputPath}`);
  console.log(`📊 Total paths: ${Object.keys(document.paths).length}`);
  
  await app.close();
  process.exit(0);
}

generateSwaggerSchema().catch((error) => {
  console.error('❌ Error generating Swagger schema:', error);
  process.exit(1);
});

