# 🎯 ПРОЕКТИРОВАНИЕ RESTful API

**Дата:** 2024  
**Версия:** 1.0.0  
**Статус:** Проектирование недостающих и доработка существующих эндпоинтов

---

## 1. ПРИНЦИПЫ ПРОЕКТИРОВАНИЯ

### 1.1 RESTful Конвенции

- Использование правильных HTTP методов (GET, POST, PUT, DELETE, PATCH)
- Иерархические пути ресурсов (`/pets/:petId/vaccinations`)
- Единообразные имена путей (kebab-case)
- Правильные HTTP статус коды
- Версионирование через префикс `/api/v1` (опционально)

### 1.2 Безопасность

- Все эндпоинты (кроме публичных) требуют JWT аутентификации
- Проверка владения ресурсами через `OwnershipGuard`
- Валидация всех входных данных через `class-validator`
- Санитизация пользовательского ввода
- Rate limiting на критичных эндпоинтах

### 1.3 Формат ответов

**Успешный ответ:**
```json
{
  "data": { ... },
  "meta": { ... } // опционально для пагинации
}
```

**Ошибка:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": { ... }
}
```

---

## 2. АУТЕНТИФИКАЦИЯ И РЕГИСТРАЦИЯ

### 2.1 Социальная авторизация (Google)

**HTTP Метод:** `POST`  
**Путь:** `/api/auth/google`  
**Аутентификация:** Не требуется

**Описание:** Авторизация пользователя через Google OAuth. Получает токен от Google, проверяет его валидность, создает или находит пользователя, возвращает JWT токены.

**Тело запроса:**
```json
{
  "token": "string", // Google ID token
  "deviceId": "string" // опционально, для отслеживания устройств
}
```

**Успешный ответ (200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-01-20T12:00:00Z",
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "name": "John Doe",
      "avatarPath": "/uploads/avatar-123.jpg",
      "isVerified": true
    }
  }
}
```

**Коды состояния:**
- `200 OK` - Успешная авторизация
- `400 Bad Request` - Неверный формат токена
- `401 Unauthorized` - Невалидный Google token
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация Google token через Google API
- Проверка email на уникальность
- Автоматическая верификация email при социальной авторизации
- Rate limiting: 10 запросов/минуту

**DTO:**
```typescript
export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  deviceId?: string;
}
```

---

### 2.2 Социальная авторизация (Apple)

**HTTP Метод:** `POST`  
**Путь:** `/api/auth/apple`  
**Аутентификация:** Не требуется

**Описание:** Авторизация пользователя через Apple Sign In. Аналогично Google, но с проверкой Apple ID token.

**Тело запроса:**
```json
{
  "token": "string", // Apple ID token
  "identityToken": "string", // опционально
  "authorizationCode": "string" // опционально
}
```

**Успешный ответ (200 OK):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-01-20T12:00:00Z",
    "user": {
      "id": 1,
      "email": "user@privaterelay.appleid.com",
      "name": "John Doe",
      "avatarPath": "/uploads/avatar-123.jpg",
      "isVerified": true
    }
  }
}
```

**Коды состояния:**
- `200 OK` - Успешная авторизация
- `400 Bad Request` - Неверный формат токена
- `401 Unauthorized` - Невалидный Apple token
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация Apple token через Apple API
- Обработка приватного email релея
- Rate limiting: 10 запросов/минуту

**DTO:**
```typescript
export class AppleAuthDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  identityToken?: string;

  @IsString()
  @IsOptional()
  authorizationCode?: string;
}
```

---

### 2.3 Запрос на восстановление пароля

**HTTP Метод:** `POST`  
**Путь:** `/api/auth/forgot-password`  
**Аутентификация:** Не требуется

**Описание:** Отправка email с токеном для сброса пароля. Генерирует временный токен, сохраняет его в БД с истечением срока действия (1 час), отправляет email с ссылкой.

**Тело запроса:**
```json
{
  "email": "user@example.com"
}
```

**Успешный ответ (200 OK):**
```json
{
  "message": "Password reset email has been sent",
  "expiresIn": 3600 // секунды
}
```

**Коды состояния:**
- `200 OK` - Email отправлен (даже если пользователь не найден, для безопасности)
- `400 Bad Request` - Неверный формат email
- `429 Too Many Requests` - Слишком много запросов
- `500 Internal Server Error` - Ошибка отправки email

**Безопасность:**
- Всегда возвращает 200 OK (даже если email не найден) для предотвращения перебора
- Токен действителен 1 час
- Одноразовый токен (после использования удаляется)
- Rate limiting: 3 запроса/час с одного IP
- Валидация email формата

**DTO:**
```typescript
export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

---

### 2.4 Сброс пароля

**HTTP Метод:** `POST`  
**Путь:** `/api/auth/reset-password`  
**Аутентификация:** Не требуется

**Описание:** Сброс пароля по токену из email. Проверяет токен, валидирует новый пароль, обновляет пароль пользователя, удаляет токен.

**Тело запроса:**
```json
{
  "token": "string", // токен из email
  "newPassword": "string", // минимум 8 символов
  "confirmPassword": "string" // должен совпадать с newPassword
}
```

**Успешный ответ (200 OK):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Коды состояния:**
- `200 OK` - Пароль успешно изменен
- `400 Bad Request` - Неверный формат данных или пароли не совпадают
- `401 Unauthorized` - Невалидный или истекший токен
- `404 Not Found` - Токен не найден
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация сложности пароля (минимум 8 символов, буквы и цифры)
- Проверка совпадения паролей
- Токен одноразовый
- Хеширование пароля через Argon2
- Rate limiting: 5 запросов/час

**DTO:**
```typescript
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/, {
    message: 'Password must contain at least one letter and one number'
  })
  newPassword: string;

  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)/)
  confirmPassword: string;
}
```

---

## 3. ПИТОМЦЫ

### 3.1 Получение списка питомцев с пагинацией и фильтрацией

**HTTP Метод:** `GET`  
**Путь:** `/api/pet/user`  
**Аутентификация:** Требуется (JWT)

**Описание:** Получение списка питомцев текущего пользователя с поддержкой пагинации, фильтрации по типу и сортировки.

**Query параметры:**
- `page` (number, опционально, default: 1) - Номер страницы
- `limit` (number, опционально, default: 20, max: 100) - Количество на странице
- `type` (string, опционально) - Фильтр по типу животного (dog, cat, bird)
- `sort` (string, опционально, default: "createdAt") - Поле для сортировки (name, createdAt, birthDate)
- `order` (string, опционально, default: "desc") - Направление сортировки (asc, desc)

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Луна",
      "animalType": {
        "id": 1,
        "name": "Собака"
      },
      "breed": "Бигль",
      "avatarPath": "/uploads/pet-123.jpg",
      "birthDate": "2014-01-01T00:00:00Z",
      "weight": 12.5,
      "color": "серый",
      "photos": [
        {
          "id": 1,
          "url": "/uploads/pet-photo-1.jpg",
          "isPrimary": true
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `401 Unauthorized` - Не авторизован
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Возвращает только питомцев текущего пользователя
- Валидация query параметров
- Максимальный limit: 100

**DTO:**
```typescript
export class GetPetsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(['dog', 'cat', 'bird'])
  type?: string;

  @IsOptional()
  @IsEnum(['name', 'createdAt', 'birthDate'])
  sort?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}
```

---

### 3.2 Экспорт паспорта питомца в PDF

**HTTP Метод:** `GET`  
**Путь:** `/api/pet/:petId/passport/pdf`  
**Аутентификация:** Требуется (JWT)

**Описание:** Генерация PDF документа с ветеринарным паспортом питомца. Включает основную информацию, вакцинации, историю посещений.

**Параметры пути:**
- `petId` (number) - ID питомца

**Query параметры:**
- `includeHistory` (boolean, опционально, default: true) - Включать ли историю посещений
- `includeVaccinations` (boolean, опционально, default: true) - Включать ли вакцинации

**Успешный ответ (200 OK):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="pet-passport-{petId}.pdf"`
- Тело: Binary PDF data

**Коды состояния:**
- `200 OK` - PDF успешно сгенерирован
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Нет доступа к питомцу
- `404 Not Found` - Питомец не найден
- `500 Internal Server Error` - Ошибка генерации PDF

**Безопасность:**
- Проверка владения питомцем
- Валидация petId
- Rate limiting: 10 запросов/час

**Реализация:**
- Использовать библиотеку `pdfkit` (уже в зависимостях)
- Генерация на сервере
- Кэширование PDF на 1 час

---

### 3.3 Получение QR-кода паспорта питомца

**HTTP Метод:** `GET`  
**Путь:** `/api/pet/:petId/passport/qr`  
**Аутентификация:** Требуется (JWT)

**Описание:** Генерация QR-кода с ссылкой на публичный просмотр паспорта питомца (для ветеринаров).

**Параметры пути:**
- `petId` (number) - ID питомца

**Query параметры:**
- `size` (number, опционально, default: 200) - Размер QR-кода в пикселях (100-500)

**Успешный ответ (200 OK):**
- Content-Type: `image/png`
- Тело: Binary PNG image data

**Коды состояния:**
- `200 OK` - QR-код успешно сгенерирован
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Нет доступа к питомцу
- `404 Not Found` - Питомец не найден
- `500 Internal Server Error` - Ошибка генерации QR

**Безопасность:**
- Проверка владения питомцем
- QR-код содержит временную ссылку (действительна 24 часа)
- Валидация размера (100-500px)

**Реализация:**
- Использовать библиотеку `qrcode` (нужно добавить)
- Генерация временной ссылки с токеном
- Кэширование QR-кода на 1 час

---

### 3.4 Унифицированный путь для загрузки фото

**HTTP Метод:** `POST`  
**Путь:** `/api/pet/:petId/photos`  
**Аутентификация:** Требуется (JWT)

**Описание:** Загрузка фотографии питомца. Поддерживает multipart/form-data.

**Параметры пути:**
- `petId` (number) - ID питомца

**Тело запроса (multipart/form-data):**
- `photo` (file, required) - Изображение (jpg, png, webp, max 5MB)
- `isPrimary` (boolean, опционально, default: false) - Сделать фото основным

**Успешный ответ (201 Created):**
```json
{
  "data": {
    "id": 1,
    "petId": 1,
    "url": "/uploads/pet-photos/pet-123-abc.jpg",
    "isPrimary": false,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Коды состояния:**
- `201 Created` - Фото успешно загружено
- `400 Bad Request` - Неверный формат файла или превышен размер
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Нет доступа к питомцу
- `404 Not Found` - Питомец не найден
- `413 Payload Too Large` - Файл слишком большой
- `500 Internal Server Error` - Ошибка загрузки

**Безопасность:**
- Проверка владения питомцем
- Валидация типа файла (только изображения)
- Валидация размера (максимум 5MB)
- Хеширование имени файла
- Санитизация имени файла

---

## 4. ВЕТЕРИНАРНЫЕ УСЛУГИ

### 4.1 Унифицированный путь для визитов в клинику

**HTTP Метод:** `POST`  
**Путь:** `/api/pets/:petId/vet-visits`  
**Аутентификация:** Требуется (JWT)

**Описание:** Создание записи о визите питомца в ветеринарную клинику.

**Параметры пути:**
- `petId` (number) - ID питомца

**Тело запроса:**
```json
{
  "clinicId": 1,
  "procedure": "Плановый осмотр",
  "description": "Общий осмотр, проверка веса",
  "diagnosis": "Здоров",
  "recomendation": "Продолжать текущий режим питания",
  "visitDate": "2025-01-15T10:00:00Z",
  "nextVisitDate": "2025-04-15T10:00:00Z",
  "doctorName": "Иванов И.И.",
  "medications": "Витамины",
  "cost": 1500.00,
  "temperature": 38.5,
  "pulse": 80,
  "respiration": 20,
  "weight": 12.5,
  "anesthesia": null,
  "complications": null,
  "files": ["/uploads/visit-1.pdf"]
}
```

**Успешный ответ (201 Created):**
```json
{
  "data": {
    "id": 1,
    "petId": 1,
    "clinicId": 1,
    "procedure": "Плановый осмотр",
    "visitDate": "2025-01-15T10:00:00Z",
    "cost": 1500.00,
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Коды состояния:**
- `201 Created` - Визит успешно создан
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Нет доступа к питомцу
- `404 Not Found` - Питомец или клиника не найдены
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Проверка владения питомцем
- Валидация всех полей
- Проверка существования клиники
- Санитизация текстовых полей

---

### 4.2 История визитов питомца

**HTTP Метод:** `GET`  
**Путь:** `/api/pets/:petId/vet-visits`  
**Аутентификация:** Требуется (JWT)

**Описание:** Получение истории визитов питомца в ветеринарные клиники с пагинацией.

**Параметры пути:**
- `petId` (number) - ID питомца

**Query параметры:**
- `page` (number, опционально, default: 1)
- `limit` (number, опционально, default: 20)
- `clinicId` (number, опционально) - Фильтр по клинике
- `fromDate` (string, опционально) - Фильтр от даты (ISO 8601)
- `toDate` (string, опционально) - Фильтр до даты (ISO 8601)

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "clinic": {
        "id": 1,
        "name": "ВетКлиника",
        "address": "Москва, ул. Примерная, 1"
      },
      "procedure": "Плановый осмотр",
      "visitDate": "2025-01-15T10:00:00Z",
      "cost": 1500.00,
      "doctorName": "Иванов И.И."
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Нет доступа к питомцу
- `404 Not Found` - Питомец не найден
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Проверка владения питомцем
- Валидация query параметров

---

### 4.3 Поиск ветеринарных клиник

**HTTP Метод:** `GET`  
**Путь:** `/api/medical/clinics`  
**Аутентификация:** Требуется (JWT)

**Описание:** Поиск ветеринарных клиник с фильтрацией и сортировкой.

**Query параметры:**
- `search` (string, опционально) - Поиск по названию, адресу
- `page` (number, опционально, default: 1)
- `limit` (number, опционально, default: 20)
- `specialty` (string, опционально) - Фильтр по специализации
- `rating` (number, опционально) - Минимальный рейтинг
- `emergencyService` (boolean, опционально) - Только с экстренной службой
- `sort` (string, опционально, default: "rating") - Сортировка (rating, name, distance)
- `lat` (number, опционально) - Широта для сортировки по расстоянию
- `lng` (number, опционально) - Долгота для сортировки по расстоянию

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "ВетКлиника",
      "address": "Москва, ул. Примерная, 1",
      "phone": "+7 (999) 123-45-67",
      "email": "info@vetclinic.ru",
      "rating": 4.8,
      "specialties": ["Хирургия", "Терапия"],
      "emergencyService": true,
      "parkingAvailable": true,
      "distance": 2.5 // км, если указаны координаты
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация всех query параметров
- Санитизация поискового запроса
- Rate limiting: 100 запросов/минуту

---

## 5. ВАКЦИНАЦИИ

### 5.1 Унифицированный путь для вакцинаций

**HTTP Метод:** `POST`  
**Путь:** `/api/pets/:petId/vaccinations`  
**Аутентификация:** Требуется (JWT)

**Описание:** Добавление записи о вакцинации питомца.

**Параметры пути:**
- `petId` (number) - ID питомца

**Тело запроса:**
```json
{
  "name": "Комплексная вакцина",
  "date": "2025-01-15T10:00:00Z",
  "nextDate": "2026-01-15T10:00:00Z",
  "clinicId": 1,
  "description": "Ежегодная вакцинация",
  "files": ["/uploads/vaccination-cert.pdf"]
}
```

**Успешный ответ (201 Created):**
```json
{
  "data": {
    "id": 1,
    "petId": 1,
    "name": "Комплексная вакцина",
    "date": "2025-01-15T10:00:00Z",
    "nextDate": "2026-01-15T10:00:00Z",
    "clinic": {
      "id": 1,
      "name": "ВетКлиника"
    },
    "createdAt": "2025-01-15T10:30:00Z"
  }
}
```

**Коды состояния:**
- `201 Created` - Вакцинация успешно добавлена
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Нет доступа к питомцу
- `404 Not Found` - Питомец или клиника не найдены
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Проверка владения питомцем
- Валидация дат (nextDate должна быть после date)
- Проверка существования клиники

---

### 5.2 Список вакцинаций питомца

**HTTP Метод:** `GET`  
**Путь:** `/api/pets/:petId/vaccinations`  
**Аутентификация:** Требуется (JWT)

**Описание:** Получение списка вакцинаций питомца с пагинацией.

**Параметры пути:**
- `petId` (number) - ID питомца

**Query параметры:**
- `page` (number, опционально, default: 1)
- `limit` (number, опционально, default: 20)
- `upcoming` (boolean, опционально) - Только предстоящие вакцинации
- `overdue` (boolean, опционально) - Только просроченные

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Комплексная вакцина",
      "date": "2025-01-15T10:00:00Z",
      "nextDate": "2026-01-15T10:00:00Z",
      "isOverdue": false,
      "clinic": {
        "id": 1,
        "name": "ВетКлиника"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `401 Unauthorized` - Не авторизован
- `403 Forbidden` - Нет доступа к питомцу
- `404 Not Found` - Питомец не найден
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Проверка владения питомцем
- Валидация query параметров

---

## 6. СОЦИАЛЬНАЯ СЕТЬ

### 6.1 Лента социальной сети

**HTTP Метод:** `GET`  
**Путь:** `/api/social/feed`  
**Аутентификация:** Требуется (JWT)

**Описание:** Получение ленты публикаций с поддержкой фильтрации по типу, хештегам и пагинации.

**Query параметры:**
- `type` (string, опционально) - Тип ленты (for_you, following, popular)
- `hashtag` (string, опционально) - Фильтр по хештегу
- `page` (number, опционально, default: 1)
- `limit` (number, опционально, default: 20)

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "author": {
        "id": 1,
        "username": "petlover",
        "avatar": "/uploads/avatar-1.jpg",
        "isVerified": false
      },
      "content": {
        "text": "Мой питомец сегодня... #здоровьекошки",
        "images": ["/uploads/post-1.jpg"],
        "video": null
      },
      "hashtags": ["здоровьекошки", "кошки"],
      "mentions": ["@vetclinic"],
      "stats": {
        "likes": 150,
        "comments": 25,
        "reposts": 10,
        "views": 500
      },
      "isLiked": false,
      "isReposted": false,
      "postType": "BLOG",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25,
    "hasMore": true
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация query параметров
- Санитизация хештега
- Rate limiting: 100 запросов/минуту
- Кэширование на 5 минут

**Бизнес-логика:**
- `for_you`: Рекомендации на основе активности пользователя
- `following`: Только от подписок
- `popular`: Сортировка по популярности (лайки + комментарии)
- Фильтр по хештегу: Поиск постов с указанным хештегом

---

### 6.2 Репост публикации

**HTTP Метод:** `POST`  
**Путь:** `/api/community-posts/:postId/repost`  
**Аутентификация:** Требуется (JWT)

**Описание:** Репост публикации в свою ленту. Создает новую публикацию с типом репоста или добавляет запись о репосте.

**Параметры пути:**
- `postId` (number) - ID публикации

**Тело запроса (опционально):**
```json
{
  "comment": "Отличный пост!" // опциональный комментарий к репосту
}
```

**Успешный ответ (201 Created):**
```json
{
  "data": {
    "id": 2,
    "originalPostId": 1,
    "authorId": 2,
    "comment": "Отличный пост!",
    "createdAt": "2025-01-15T11:00:00Z"
  }
}
```

**Коды состояния:**
- `201 Created` - Репост успешно создан
- `400 Bad Request` - Публикация уже отрепощена
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Публикация не найдена
- `409 Conflict` - Уже отрепощено
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Проверка существования публикации
- Валидация комментария (максимум 500 символов)
- Санитизация комментария
- Защита от дублирования репостов

---

### 6.3 Лента по хештегу

**HTTP Метод:** `GET`  
**Путь:** `/api/social/hashtags/:hashtag`  
**Аутентификация:** Требуется (JWT)

**Описание:** Получение всех публикаций с указанным хештегом.

**Параметры пути:**
- `hashtag` (string) - Хештег (без символа #)

**Query параметры:**
- `page` (number, опционально, default: 1)
- `limit` (number, опционально, default: 20)
- `sort` (string, опционально, default: "recent") - Сортировка (recent, popular)

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "author": { ... },
      "content": { ... },
      "hashtags": ["здоровьекошки"],
      "stats": { ... },
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3,
    "hashtag": "здоровьекошки"
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `400 Bad Request` - Неверный формат хештега
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Хештег не найден
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация хештега (только буквы, цифры, кириллица)
- Санитизация хештега
- Rate limiting: 100 запросов/минуту
- Кэширование на 10 минут

---

## 7. ПЛАТЕЖИ

### 7.1 Создание платежной сессии

**HTTP Метод:** `POST`  
**Путь:** `/api/payment/session`  
**Аутентификация:** Требуется (JWT)

**Описание:** Создание платежной сессии для оплаты услуги. Генерирует уникальную сессию с временем истечения.

**Тело запроса:**
```json
{
  "serviceId": 1,
  "orderId": "order_123",
  "serviceType": "veterinary", // veterinary, grooming, boarding, charity, subscription
  "metadata": {
    "petId": 1,
    "clinicId": 1,
    "appointmentDate": "2025-01-20T10:00:00Z"
  }
}
```

**Успешный ответ (200 OK):**
```json
{
  "data": {
    "id": "session_abc123",
    "amount": 1500.00,
    "currency": "RUB",
    "description": "Консультация ветеринара",
    "status": "pending",
    "expiresAt": "2025-01-20T12:00:00Z",
    "serviceType": "veterinary",
    "paymentMethods": ["card", "apple_pay", "google_pay"]
  }
}
```

**Коды состояния:**
- `200 OK` - Сессия успешно создана
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Услуга не найдена
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация всех полей
- Проверка существования услуги
- Генерация уникального ID сессии
- Время истечения: 2 часа
- Rate limiting: 20 запросов/минуту

**Бизнес-логика:**
- Получение цены услуги из БД
- Расчет итоговой суммы (с учетом скидок, если есть)
- Определение доступных методов оплаты
- Создание записи в таблице Payment с статусом "pending"

---

### 7.2 Обработка платежа

**HTTP Метод:** `POST`  
**Путь:** `/api/payment/session/:sessionId/process`  
**Аутентификация:** Требуется (JWT)

**Описание:** Обработка платежа через выбранный метод оплаты.

**Параметры пути:**
- `sessionId` (string) - ID платежной сессии

**Тело запроса:**
```json
{
  "paymentMethod": "card", // card, apple_pay, google_pay, stripe
  "paymentData": {
    "cardToken": "tok_123", // для Stripe
    "saveCard": false
  }
}
```

**Успешный ответ (200 OK):**
```json
{
  "data": {
    "id": "payment_xyz789",
    "sessionId": "session_abc123",
    "amount": 1500.00,
    "currency": "RUB",
    "status": "processing",
    "transactionId": "txn_123456",
    "createdAt": "2025-01-15T11:00:00Z"
  }
}
```

**Коды состояния:**
- `200 OK` - Платеж обрабатывается
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Сессия не найдена
- `410 Gone` - Сессия истекла
- `409 Conflict` - Платеж уже обработан
- `500 Internal Server Error` - Ошибка обработки

**Безопасность:**
- Проверка владения сессией
- Проверка срока действия сессии
- Валидация метода оплаты
- Интеграция с платежными системами (Stripe, CloudPayments)
- Не хранить данные карт на сервере

---

### 7.3 История транзакций

**HTTP Метод:** `GET`  
**Путь:** `/api/transactions`  
**Аутентификация:** Требуется (JWT)

**Описание:** Получение истории всех транзакций пользователя с пагинацией и фильтрацией.

**Query параметры:**
- `page` (number, опционально, default: 1)
- `limit` (number, опционально, default: 20)
- `status` (string, опционально) - Фильтр по статусу (pending, paid, refunded, failed)
- `serviceType` (string, опционально) - Фильтр по типу услуги
- `fromDate` (string, опционально) - Фильтр от даты
- `toDate` (string, опционально) - Фильтр до даты

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "amount": 1500.00,
      "currency": "RUB",
      "status": "paid",
      "serviceType": "veterinary",
      "description": "Консультация ветеринара",
      "paymentMethod": "card",
      "transactionId": "txn_123456",
      "createdAt": "2025-01-15T11:00:00Z",
      "paidAt": "2025-01-15T11:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "totalPages": 2,
    "totalAmount": 37500.00
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Возвращает только транзакции текущего пользователя
- Валидация query параметров
- Rate limiting: 60 запросов/минуту

---

## 8. ПРИЮТЫ И БЛАГОТВОРИТЕЛЬНОСТЬ

### 8.1 Усыновление питомца из приюта

**HTTP Метод:** `POST`  
**Путь:** `/api/shelters/:shelterId/animals/:animalId/adopt`  
**Аутентификация:** Требуется (JWT)

**Описание:** Оформление усыновления питомца из приюта. Создает заявку на усыновление и связывает питомца с пользователем.

**Параметры пути:**
- `shelterId` (number) - ID приюта
- `animalId` (number) - ID животного в приюте

**Тело запроса:**
```json
{
  "contactPhone": "+7 (999) 123-45-67",
  "address": "Москва, ул. Примерная, д. 1",
  "adoptionReason": "Хочу подарить дом и заботу",
  "previousExperience": true,
  "agreementAccepted": true
}
```

**Успешный ответ (201 Created):**
```json
{
  "data": {
    "id": 1,
    "shelterId": 1,
    "animalId": 1,
    "userId": 1,
    "status": "pending",
    "contactPhone": "+7 (999) 123-45-67",
    "createdAt": "2025-01-15T12:00:00Z",
    "message": "Заявка на усыновление отправлена. С вами свяжутся в ближайшее время."
  }
}
```

**Коды состояния:**
- `201 Created` - Заявка успешно создана
- `400 Bad Request` - Ошибки валидации или животное уже усыновлено
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Приют или животное не найдены
- `409 Conflict` - Животное уже усыновлено или заявка уже существует
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация всех полей
- Проверка существования приюта и животного
- Проверка, что животное не усыновлено
- Проверка согласия на обработку данных
- Отправка уведомления приюту
- Rate limiting: 5 запросов/час

**Бизнес-логика:**
- Создание записи о заявке на усыновление
- Отправка email приюту
- Создание уведомления для пользователя
- Обновление статуса животного на "reserved" (не "adopted" до подтверждения)

---

### 8.2 Пожертвование приюту

**HTTP Метод:** `POST`  
**Путь:** `/api/shelters/:shelterId/donations`  
**Аутентификация:** Требуется (JWT)

**Описание:** Создание пожертвования приюту. Создает платежную сессию для пожертвования.

**Параметры пути:**
- `shelterId` (number) - ID приюта

**Тело запроса:**
```json
{
  "amount": 1000.00,
  "currency": "RUB",
  "message": "Спасибо за вашу работу!",
  "anonymous": false,
  "recurring": false // для регулярных пожертвований
}
```

**Успешный ответ (201 Created):**
```json
{
  "data": {
    "id": 1,
    "shelterId": 1,
    "amount": 1000.00,
    "currency": "RUB",
    "status": "pending",
    "paymentSessionId": "session_abc123",
    "createdAt": "2025-01-15T12:00:00Z"
  }
}
```

**Коды состояния:**
- `201 Created` - Пожертвование успешно создано
- `400 Bad Request` - Ошибки валидации (сумма должна быть > 0)
- `401 Unauthorized` - Не авторизован
- `404 Not Found` - Приют не найден
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация суммы (минимум 100 рублей)
- Проверка существования приюта
- Санитизация сообщения
- Создание платежной сессии
- Rate limiting: 10 запросов/минуту

**Бизнес-логика:**
- Создание записи о пожертвовании
- Создание платежной сессии
- После успешной оплаты: обновление статистики приюта, отправка благодарности

---

### 8.3 Поиск передержек

**HTTP Метод:** `GET`  
**Путь:** `/api/pet-boarding/search`  
**Аутентификация:** Требуется (JWT)

**Описание:** Поиск передержек для питомцев с фильтрацией по местоположению, датам, типу животного.

**Query параметры:**
- `search` (string, опционально) - Поиск по названию, адресу
- `petType` (string, опционально) - Тип животного (dog, cat, bird)
- `startDate` (string, опционально) - Дата начала (ISO 8601)
- `endDate` (string, опционально) - Дата окончания (ISO 8601)
- `maxPrice` (number, опционально) - Максимальная цена за день
- `lat` (number, опционально) - Широта для поиска по радиусу
- `lng` (number, опционально) - Долгота для поиска по радиусу
- `radius` (number, опционально, default: 10) - Радиус поиска в км
- `page` (number, опционально, default: 1)
- `limit` (number, опционально, default: 20)
- `sort` (string, опционально, default: "rating") - Сортировка (rating, price, distance)

**Успешный ответ (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Уютный дом для собак",
      "address": "Москва, ул. Примерная, 1",
      "pricePerDay": 1500.00,
      "rating": 4.8,
      "availableSpots": 3,
      "amenities": ["вольер", "игровая площадка"],
      "distance": 2.5, // км, если указаны координаты
      "isAvailable": true // есть свободные места на указанные даты
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

**Коды состояния:**
- `200 OK` - Успешно
- `400 Bad Request` - Ошибки валидации
- `401 Unauthorized` - Не авторизован
- `500 Internal Server Error` - Ошибка сервера

**Безопасность:**
- Валидация всех query параметров
- Санитизация поискового запроса
- Проверка дат (endDate должна быть после startDate)
- Rate limiting: 100 запросов/минуту

---

## 9. ДОРАБОТКА СУЩЕСТВУЮЩИХ ЭНДПОИНТОВ

### 9.1 Обновление профиля пользователя (с проверкой владения)

**HTTP Метод:** `PUT`  
**Путь:** `/api/user/:id`  
**Аутентификация:** Требуется (JWT)

**Изменения:**
- Добавить проверку владения через `OwnershipGuard`
- Использовать декоратор `@Resource('user')`

**Безопасность:**
```typescript
@Put(':id')
@Auth()
@Resource('user')
@UseGuards(OwnershipGuard)
async updateUserProfile(
  @Param('id') id: string,
  @Body() userData: UpdateUserDto,
  @CurrentUser() user: User
) {
  // OwnershipGuard автоматически проверит, что user.id === id
  return this.userService.updateUserProfile(+id, userData);
}
```

---

### 9.2 Обновление/удаление питомца (с проверкой владения)

**HTTP Метод:** `PUT`, `DELETE`  
**Путь:** `/api/pet/:id`  
**Аутентификация:** Требуется (JWT)

**Изменения:**
- Добавить проверку владения через `OwnershipGuard`
- Использовать декоратор `@Resource('pet')`

**Безопасность:**
```typescript
@Put(':id')
@Auth()
@Resource('pet')
@UseGuards(OwnershipGuard)
async updatePet(
  @Param('id') id: string,
  @Body() petData: UpdatePetDto
) {
  return this.petService.updatePet(+id, petData);
}

@Delete(':id')
@Auth()
@Resource('pet')
@UseGuards(OwnershipGuard)
async deletePet(@Param('id') id: string) {
  return this.petService.deletePet(+id);
}
```

---

### 9.3 Улучшение ответа при логине

**HTTP Метод:** `POST`  
**Путь:** `/api/auth/login`  
**Аутентификация:** Не требуется

**Текущий ответ:**
```json
{
  "userFields": { ... },
  "accessToken": "...",
  "refreshToken": "...",
  "expiresAt": "..."
}
```

**Рекомендуемый ответ (соответствие спецификации):**
```json
{
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": "2025-01-20T12:00:00Z",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "avatarPath": "/uploads/avatar.jpg"
    }
  }
}
```

---

## 10. ОБЩИЕ РЕКОМЕНДАЦИИ

### 10.1 Унификация путей

**Принципы:**
- Использовать множественное число для коллекций: `/pets`, `/users`, `/clinics`
- Вложенные ресурсы: `/pets/:petId/vaccinations`
- Действия через глаголы: `/pets/:petId/photos/upload` (если нужно)

**Примеры правильных путей:**
- ✅ `/api/pets/:petId/vaccinations` (вместо `/api/vaccination`)
- ✅ `/api/pets/:petId/vet-visits` (вместо `/api/admission-vet-clinic`)
- ✅ `/api/pet/:petId/passport` (уже правильно)

### 10.2 Пагинация

**Везде использовать:**
```typescript
export class PaginationQueryDto extends PaginationDto {
  // дополнительные параметры
}
```

**Формат ответа:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasMore": true
  }
}
```

### 10.3 Обработка ошибок

**Единообразный формат:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": {
    "field": ["error message"]
  },
  "timestamp": "2025-01-15T12:00:00Z",
  "path": "/api/pets"
}
```

### 10.4 Валидация

**Использовать class-validator:**
- `@IsString()`, `@IsNumber()`, `@IsEmail()`
- `@IsNotEmpty()`, `@IsOptional()`
- `@Min()`, `@Max()`, `@MinLength()`, `@MaxLength()`
- Кастомные валидаторы для сложных проверок

### 10.5 Безопасность

**Для всех защищенных эндпоинтов:**
1. JWT аутентификация через `@Auth()`
2. Проверка владения через `OwnershipGuard` где необходимо
3. Валидация всех входных данных
4. Санитизация текстовых полей
5. Rate limiting на критичных эндпоинтах
6. Логирование подозрительной активности

---

## 11. ПРИОРИТИЗАЦИЯ РЕАЛИЗАЦИИ

### Фаза 1 (Критично - 1-2 недели)
1. ✅ Проверка владения ресурсами (OwnershipGuard)
2. ✅ Социальная авторизация (Google/Apple)
3. ✅ Восстановление пароля
4. ✅ Платежная сессия
5. ✅ Усыновление питомца
6. ✅ Пожертвования

### Фаза 2 (Важно - 2-3 недели)
1. ✅ Экспорт паспорта в PDF
2. ✅ Лента социальной сети
3. ✅ Репосты
4. ✅ Унификация путей API
5. ✅ Пагинация везде
6. ✅ Поиск клиник и передержек

### Фаза 3 (Улучшения - 1 месяц)
1. ✅ QR-код паспорта
2. ✅ Лента по хештегу
3. ✅ Улучшение ответов API
4. ✅ Дополнительная валидация
5. ✅ Оптимизация запросов

---

## 12. ЗАКЛЮЧЕНИЕ

Данный документ содержит проектирование всех недостающих эндпоинтов и рекомендации по доработке существующих. Все эндпоинты спроектированы с учетом:

- ✅ RESTful конвенций
- ✅ Безопасности (аутентификация, авторизация, валидация)
- ✅ Масштабируемости (пагинация, фильтрация)
- ✅ Соответствия спецификациям
- ✅ Единообразия форматов ответов

**Следующий шаг:** Реализация эндпоинтов согласно приоритизации.

