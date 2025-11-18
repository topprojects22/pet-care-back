# MCP и JSON схемы для Pet Care Backend

## Рекомендуемые MCP (Model Context Protocol) серверы

### 1. **GitHub MCP** (уже установлен)
- **Назначение**: Управление репозиторием, создание issues, PR, поиск кода
- **Использование**: Для интеграции с GitHub, автоматизации workflow
- **Примеры использования**:
  - Создание issues из ошибок
  - Автоматическое создание PR для обновлений
  - Поиск примеров кода в других проектах

### 2. **Context7 MCP** (рекомендуется)
- **Назначение**: Получение актуальной документации библиотек
- **Использование**: Для работы с NestJS, Prisma, TypeScript документацией
- **Преимущества**: 
  - Актуальная документация
  - Примеры кода
  - API reference

### 3. **SwiftLens MCP** (не требуется для этого проекта)
- **Назначение**: Анализ Swift кода
- **Примечание**: Не нужен для NestJS/TypeScript проекта

### 4. **Dart MCP** (не требуется для этого проекта)
- **Назначение**: Работа с Flutter/Dart проектами
- **Примечание**: Не нужен для NestJS/TypeScript проекта

## Рекомендуемые решения для генерации JSON схем

### 1. **Swagger/OpenAPI** (уже установлен: `@nestjs/swagger`)

#### Настройка
Swagger уже настроен в `main.ts`. Для генерации JSON схемы:

```typescript
// В main.ts уже есть настройка Swagger
const document = SwaggerModule.createDocument(app, config);

// Для экспорта JSON схемы:
import { writeFileSync } from 'fs';
writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
```

#### Использование
1. Запустите приложение: `npm run start:dev`
2. Откройте Swagger UI: `http://localhost:5000/api/docs`
3. Экспортируйте JSON схему через UI или API: `http://localhost:5000/api/docs-json`

#### Генерация схемы автоматически
Создайте скрипт `scripts/generate-swagger-schema.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { writeFileSync } from 'fs';

async function generateSwaggerSchema() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Pet Care API')
    .setDescription('API для управления уходом за домашними животными')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync('./swagger-schema.json', JSON.stringify(document, null, 2));
  console.log('Swagger schema generated: swagger-schema.json');
  await app.close();
}

generateSwaggerSchema();
```

Добавьте в `package.json`:
```json
"scripts": {
  "swagger:generate": "ts-node scripts/generate-swagger-schema.ts"
}
```

### 2. **JSON Schema Generator** (альтернатива)

#### Установка
```bash
npm install --save-dev @nestjs/swagger json-schema-to-typescript
```

#### Использование
```typescript
import { getSchemaPath } from '@nestjs/swagger';
import { CreatePetPhotoDto } from './dto/create-pet-photo.dto';

// В контроллере:
@ApiResponse({
  status: 201,
  description: 'Photo uploaded successfully',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      file: {
        type: 'object',
        properties: {
          url: { type: 'string' },
          filename: { type: 'string' },
          hash: { type: 'string' },
        },
      },
    },
  },
})
```

### 3. **TypeScript to JSON Schema** (для генерации типов на фронтенде)

#### Установка
```bash
npm install --save-dev typescript-json-schema
```

#### Использование
```bash
# Генерация JSON схемы из TypeScript типов
npx typescript-json-schema tsconfig.json "CreatePetPhotoDto" --out create-pet-photo.schema.json
```

### 4. **Zod для валидации и генерации схем**

#### Установка
```bash
npm install zod zod-to-json-schema
```

#### Пример использования
```typescript
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const CreatePetPhotoSchema = z.object({
  isPrimary: z.boolean().optional(),
});

// Генерация JSON схемы
const jsonSchema = zodToJsonSchema(CreatePetPhotoSchema, 'CreatePetPhoto');
```

## Рекомендуемая настройка для фронтенда

### 1. **Автоматическая генерация типов из Swagger**

#### Использование `swagger-typescript-api`
```bash
npm install --save-dev swagger-typescript-api
```

Создайте скрипт `scripts/generate-api-types.ts`:
```typescript
import { generateApi } from 'swagger-typescript-api';
import { readFileSync } from 'fs';

generateApi({
  name: 'PetCareApi',
  output: './frontend/src/api',
  url: 'http://localhost:5000/api/docs-json',
  // или из файла:
  // input: './swagger-schema.json',
  httpClientType: 'axios', // или 'fetch'
  generateClient: true,
  generateRouteTypes: true,
  generateResponses: true,
}).then(({ files, configuration }) => {
  console.log('API types generated successfully!');
});
```

### 2. **Использование OpenAPI Generator**

```bash
npm install --save-dev @openapitools/openapi-generator-cli
```

```bash
# Генерация TypeScript клиента
npx @openapitools/openapi-generator-cli generate \
  -i http://localhost:5000/api/docs-json \
  -g typescript-axios \
  -o ./frontend/src/api
```

### 3. **Ручная генерация через Swagger UI**

1. Откройте `http://localhost:5000/api/docs`
2. Нажмите на кнопку "Download" или используйте endpoint `/api/docs-json`
3. Используйте онлайн генераторы:
   - https://editor.swagger.io/ (Swagger Editor)
   - https://openapi-generator.tech/ (OpenAPI Generator)

## Интеграция с фронтендом

### Пример использования с React/TypeScript

```typescript
// frontend/src/api/types.ts (сгенерировано из Swagger)
export interface CreatePetPhotoDto {
  isPrimary?: boolean;
}

export interface PetPhotoResponse {
  id: number;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  hash: string;
}

// frontend/src/api/petPhoto.ts
import axios from 'axios';
import { CreatePetPhotoDto, PetPhotoResponse } from './types';

export const uploadPetPhoto = async (
  petId: number,
  file: File,
  dto?: CreatePetPhotoDto,
): Promise<PetPhotoResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (dto?.isPrimary) {
    formData.append('isPrimary', 'true');
  }

  const response = await axios.post<PetPhotoResponse>(
    `/api/pets/${petId}/photos/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data;
};
```

## Рекомендуемый workflow

1. **Разработка API**:
   - Создайте DTOs с декораторами Swagger
   - Добавьте `@ApiOperation`, `@ApiResponse` в контроллеры
   - Запустите приложение и проверьте Swagger UI

2. **Генерация схемы**:
   ```bash
   npm run swagger:generate
   ```

3. **Экспорт для фронтенда**:
   - Используйте `swagger-typescript-api` для генерации типов
   - Или используйте OpenAPI Generator
   - Или вручную экспортируйте из Swagger UI

4. **Интеграция**:
   - Импортируйте сгенерированные типы на фронтенде
   - Используйте их для типизации API вызовов
   - Обновляйте типы при изменении API

## Полезные команды

```bash
# Генерация Swagger схемы
npm run swagger:generate

# Запуск с Swagger UI
npm run start:dev
# Откройте http://localhost:5000/api/docs

# Экспорт JSON схемы
curl http://localhost:5000/api/docs-json > swagger-schema.json
```

## Дополнительные инструменты

### 1. **Postman/Insomnia**
- Импорт из Swagger JSON
- Автоматическая генерация коллекций
- Тестирование API

### 2. **Redoc**
- Альтернатива Swagger UI
- Более читаемая документация
- Установка: `npm install redoc-cli`

### 3. **API Blueprint**
- Альтернативный формат документации
- Можно конвертировать из Swagger

## Заключение

Для данного проекта рекомендуется:
1. **Использовать Swagger** (уже настроен) для генерации JSON схем
2. **Добавить скрипт генерации** схемы в `package.json`
3. **Использовать `swagger-typescript-api`** для генерации типов на фронтенде
4. **Документировать все endpoints** с помощью Swagger декораторов
5. **Экспортировать схему** автоматически при деплое

Это обеспечит синхронизацию типов между бэкендом и фронтендом и упростит разработку.

