# 📚 Руководство по утилитам

## Обзор

Проект включает богатый набор утилит для упрощения разработки. Все утилиты экспортируются из `src/common/utils/index.ts`.

---

## 📅 Работа с датами (date.util.ts)

### Основные функции

```typescript
import { formatDate, startOfDay, endOfDay, diffInDays } from '../common/utils';

// Форматирование
const iso = formatDate(new Date()); // "2024-01-01T00:00:00.000Z"

// Начало/конец дня
const start = startOfDay(new Date());
const end = endOfDay(new Date());

// Разница в днях
const days = diffInDays(startDate, endDate);

// Добавление дней
const future = addDays(new Date(), 7);

// Проверка диапазона
const inRange = isDateInRange(date, startDate, endDate);
```

---

## 📝 Работа со строками (string.util.ts)

### Основные функции

```typescript
import { truncate, slugify, maskEmail, maskPhone } from '../common/utils';

// Обрезка строки
const short = truncate('Very long text', 20); // "Very long text..."

// Создание slug
const slug = slugify('Hello World!'); // "hello-world"

// Маскирование данных
const maskedEmail = maskEmail('user@example.com'); // "u***@example.com"
const maskedPhone = maskPhone('+79991234567'); // "+*******4567"

// Капитализация
const capitalized = capitalize('hello'); // "Hello"
const words = capitalizeWords('hello world'); // "Hello World"

// Генерация случайной строки
const random = generateRandomString(32);
```

---

## 📊 Работа с массивами (array.util.ts)

### Основные функции

```typescript
import { chunk, unique, groupBy, sortBy, shuffle } from '../common/utils';

// Разделение на чанки
const chunks = chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// Удаление дубликатов
const uniqueItems = unique([1, 2, 2, 3]); // [1, 2, 3]

// Группировка
const grouped = groupBy(users, 'role');
// { admin: [...], user: [...] }

// Сортировка
const sorted = sortBy(users, 'name', 'asc');

// Перемешивание
const shuffled = shuffle([1, 2, 3, 4, 5]);

// Случайный элемент
const random = randomItem([1, 2, 3, 4, 5]);
```

---

## 📁 Работа с файлами (file.util.ts)

### Основные функции

```typescript
import { validateFile, generateFileName, isImageFile } from '../common/utils';

// Валидация файла
const result = validateFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['jpg', 'png'],
});

if (!result.valid) {
  throw new BadRequestException(result.error);
}

// Генерация имени файла
const fileName = generateFileName('photo.jpg', 'pet');

// Проверка типа
const isImage = isImageFile('photo.jpg'); // true
```

---

## ✅ Валидация (validation.util.ts)

### Основные функции

```typescript
import {
  isValidEmail,
  isValidUrl,
  isValidPhone,
  isStrongPassword,
} from '../common/utils';

// Email
if (!isValidEmail(email)) {
  throw new BadRequestException('Invalid email');
}

// URL
if (!isValidUrl(url)) {
  throw new BadRequestException('Invalid URL');
}

// Телефон
if (!isValidPhone(phone)) {
  throw new BadRequestException('Invalid phone');
}

// Пароль
const passwordCheck = isStrongPassword(password);
if (!passwordCheck.valid) {
  throw new BadRequestException(passwordCheck.errors.join(', '));
}
```

---

## 🔄 Трансформация данных (transform.util.ts)

### Основные функции

```typescript
import { omit, pick, deepClone, deepMerge } from '../common/utils';

// Исключение полей
const withoutPassword = omit(user, ['password', 'token']);

// Выбор полей
const publicUser = pick(user, ['id', 'name', 'email']);

// Глубокое копирование
const cloned = deepClone(complexObject);

// Глубокое слияние
const merged = deepMerge(target, source1, source2);
```

---

## ⚡ Асинхронные операции (async.util.ts)

### Основные функции

```typescript
import {
  delay,
  withTimeout,
  pLimit,
  retryAsync,
} from '../common/utils';

// Задержка
await delay(1000); // 1 секунда

// Таймаут
const result = await withTimeout(
  longRunningOperation(),
  5000,
  'Operation timed out',
);

// Ограничение параллелизма
const results = await pLimit(tasks, 3); // Максимум 3 одновременно

// Retry
const result = await retryAsync(
  () => fetchData(),
  {
    maxAttempts: 3,
    delay: 1000,
    onRetry: (attempt, error) => {
      console.log(`Retry ${attempt}: ${error.message}`);
    },
  },
);
```

---

## 📈 Производительность (performance.util.ts)

### Основные функции

```typescript
import { measureTime, PerformanceProfiler } from '../common/utils';

// Измерение времени
const { result, duration } = await measureTime(
  () => expensiveOperation(),
  'Operation name',
);

// Профилировщик
const profiler = new PerformanceProfiler();
const stop = profiler.start('database-query');
// ... выполнение операции
stop();
const stats = profiler.getStats('database-query');
// { count: 1, total: 123.45, average: 123.45, min: 123.45, max: 123.45 }
```

---

## 🌍 Переменные окружения (env.util.ts)

### Основные функции

```typescript
import {
  getEnv,
  getEnvNumber,
  getEnvBoolean,
  getEnvArray,
  isProduction,
} from '../common/utils';

// Получение переменных
const dbUrl = getEnv('DATABASE_URL');
const port = getEnvNumber('PORT', 5000);
const debug = getEnvBoolean('DEBUG', false);
const origins = getEnvArray('CORS_ORIGIN', ['http://localhost:3000']);

// Проверка окружения
if (isProduction()) {
  // Production логика
}
```

---

## 🔍 Работа с типами (type.util.ts)

### Основные функции

```typescript
import { isObject, isEmpty, get, set } from '../common/utils';

// Проверка типов
if (isObject(value)) {
  // value - объект
}

// Проверка на пустоту
if (isEmpty(value)) {
  // null, undefined, '', [], {}
}

// Безопасный доступ к свойствам
const email = get(user, 'profile.email', 'default@example.com');

// Установка значения
set(user, 'profile.email', 'new@example.com');
```

---

## 🗄️ Prisma утилиты (prisma.util.ts)

### Основные функции

```typescript
import {
  buildDateRangeFilter,
  buildNumberRangeFilter,
  buildArrayFilter,
} from '../common/utils';

// Фильтр по дате
const dateFilter = buildDateRangeFilter('createdAt', startDate, endDate);

// Фильтр по числовому диапазону
const priceFilter = buildNumberRangeFilter('price', 100, 1000);

// Фильтр по массиву
const statusFilter = buildArrayFilter('status', ['active', 'pending']);

// Использование в запросе
const users = await prisma.user.findMany({
  where: {
    ...dateFilter,
    ...priceFilter,
  },
});
```

---

## 📤 Форматирование ответов (response.util.ts)

### Основные функции

```typescript
import { successResponse, paginatedResponse, messageResponse } from '../common/utils';

// Успешный ответ
return successResponse(data, 'Operation completed');

// Пагинированный ответ
return paginatedResponse(items, page, limit, total);

// Ответ с сообщением
return messageResponse('User created successfully');
```

---

## 🎯 Рекомендации

1. **Используйте централизованный импорт:**
   ```typescript
   import { truncate, isValidEmail } from '../common/utils';
   ```

2. **Комбинируйте утилиты:**
   ```typescript
   const cleanSlug = slugify(truncate(title, 50));
   ```

3. **Используйте утилиты для валидации:**
   ```typescript
   if (!isValidEmail(email)) {
     throw new BadRequestException('Invalid email');
   }
   ```

4. **Применяйте утилиты производительности:**
   ```typescript
   const { result, duration } = await measureTime(
     () => expensiveOperation(),
   );
   ```

---

Для дополнительной информации см. [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md)

