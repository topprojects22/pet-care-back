# Спецификация Пользовательского Интерфейса для MVP
## Часть 2.4: Vet Profile

**Версия:** 1.0  
**Дата:** 2025-01-XX  
**Статус:** Draft

---

## 1. Vet Profile

### 1.1. Цель и Контекст

**Бизнес-задача:** Детальный профиль ветеринарной клиники с полной информацией: рейтинг, описание, контакты, часы работы, услуги, врачи, удобства и специализации. Возможность записи на приём.

**Место в сценарии:** Отображается при выборе клиники из Vet List или из других мест приложения. Является ключевым экраном для принятия решения о записи к ветеринару.

**Ключевые функции:** Просмотр информации о клинике, контакты, запись на приём, просмотр врачей и услуг.

### 1.2. Элементы Интерфейса и Функциональность

#### 1.2.1. Структура Экрана

**Компонент: TitleTopWidget (Header)**
- Заголовок: `viewModel.vet?.name ?? "Клиника"` (динамически)
- Левая иконка: Стрелка назад (`left-arrow-20`)
  - Действие: `viewModel.navigateBack()`
- Правая иконка: Поделиться (`share-20`)
  - Действие: Открытие системного диалога шаринга
- Отступы: Горизонтальные 20 points

**Компонент: ImageCarouselUI (Карусель фото)**
- Условие: Если `vet.images` не пуст
- Тип: Горизонтальная прокручиваемая карусель
- Изображения: `vet.images` (массив URL или asset names)
- Автоплей: `false`
- Высота: 250 points
- Закругление: 16 points
- Отступы: Горизонтальные 20 points

**Секция "Рейтинг" (ratingSection):**
- Фон: `.systemBackground`
- Закругление: 16 points
- Содержимое:
  - Рейтинг: `String(format: "%.1f", vet.rating)` (32pt, bold)
  - Компонент: `RatingUI(rating: vet.rating)` (звезды)
  - Количество отзывов: "\(vet.reviewCount) отзывов" (subheadline, серый)
- Отступы: Padding внутри, горизонтальные 20 points

**Секция "О клинике" (descriptionSection):**
- Заголовок: "О клинике" (title3, bold)
- Описание: `ExpandableTextUI`
  - Конфигурация:
    - `collapsedLineLimit: 3` (показывать 3 строки)
    - Кнопка "Читать далее" / "Свернуть"
    - Стиль: subheadline, цвет indigo
- Фон: `.systemBackground`
- Закругление: 16 points
- Отступы: Padding внутри, горизонтальные 20 points

**Секция "Контакты" (contactSection):**
- Заголовок: "Контакты" (title3, bold)
- Компоненты: `ContactRow`
  - **Адрес:**
    - Иконка: `location-20`
    - Заголовок: "Адрес"
    - Значение: `vet.address`
    - Действие: `viewModel.openMap(address:)`
  - **Телефон:**
    - Иконка: `internet-20`
    - Заголовок: "Телефон"
    - Значение: `vet.phone`
    - Действие: `viewModel.callPhone(vet.phone)`
  - **Email (если есть):**
    - Иконка: `filter-mail-20`
    - Заголовок: "Email"
    - Значение: `vet.email`
    - Действие: Открытие `mailto:` URL
  - **Сайт (если есть):**
    - Иконка: `internet-20`
    - Заголовок: "Сайт"
    - Значение: `vet.website`
    - Действие: `viewModel.openWebsite(website)`
- Разделители: `Divider()` между элементами
- Фон: `.systemBackground`
- Закругление: 16 points
- Отступы: Padding внутри, горизонтальные 20 points

**Компонент ContactRow:**
- Структура:
  - Иконка: 20x20 points, цвет indigo
  - VStack:
    - Заголовок: caption, серый цвет
    - Значение: callout, основной цвет
  - Стрелка: `chevron.right`, серый цвет
- Действие: Тап на всю строку → выполнение действия

**Секция "Часы работы" (workingHoursSection):**
- Заголовок: "Часы работы" (title3, bold)
- Компоненты: `WorkingHoursRow` для каждого дня недели
  - Пн, Вт, Ср, Чт, Пт, Сб, Вс
  - Структура:
    - День недели: callout, ширина 30 points
    - Расписание: "HH:mm - HH:mm" или "Выходной"
- Фон: `.systemBackground`
- Закругление: 16 points
- Отступы: Padding внутри, горизонтальные 20 points

**Компонент WorkingHoursRow:**
- День недели: Сокращение (Пн, Вт, и т.д.)
- Расписание: Время работы или "Выходной"
- Цвет: Основной для открыто, серый для выходного

**Секция "Услуги" (servicesSection):**
- Заголовок: "Услуги" (title3, bold)
- Компоненты: `ServiceRow` (первые 6 услуг)
  - Название: callout, medium, основной цвет
  - Описание (если есть): caption, серый цвет
  - Цена: callout, semibold, цвет indigo (формат: "X ₽")
- Разделители: `Divider()` между услугами
- Фон: `.systemBackground`
- Закругление: 16 points
- Отступы: Padding внутри, горизонтальные 20 points

**Секция "Врачи" (doctorsSection):**
- Заголовок: "Врачи" (title3, bold)
- Тип: Горизонтальный ScrollView
- Компоненты: `DoctorCard`
  - Фото: Круглое, 100x100 points
  - Имя: callout, semibold, максимум 2 строки
  - Специализация: caption, серый цвет
  - Опыт (если есть): "X лет опыта", caption2, серый
  - Рейтинг (если есть): Звезда + значение, caption2
- Ширина карточки: 120 points
- Фон карточки: `.systemGray6`
- Закругление: 12 points
- Отступы: Padding внутри, горизонтальные 20 points

**Секция "Удобства и Специализации" (facilitiesSection):**
- **Удобства:**
  - Заголовок: "Удобства" (title3, bold)
  - Компонент: `FlowLayout` с `TagUI`
  - Теги: `vet.facilities` (массив строк)
- **Специализации:**
  - Заголовок: "Специализации" (title3, bold)
  - Компонент: `FlowLayout` с `TagUI`
  - Теги: `vet.specialties` (массив строк)
- Фон: `.systemBackground`
- Закругление: 16 points
- Отступы: Padding внутри, горизонтальные 20 points

**Кнопка "Записаться на приём":**
- Компонент: `ButtonUI`
- Стиль: Primary button, размер large, цвет indigo
- Текст: "Записаться на приём" (локализованный)
- Действие: Открытие формы записи (TODO)
- Отступы: Горизонтальные 20 points, нижний 20 points

#### 1.2.2. Интерактивность

**Тап на стрелку назад:**
- Возврат на предыдущий экран
- Действие: `viewModel.navigateBack()`

**Тап на иконку "Поделиться":**
- Открытие системного диалога шаринга
- Действие: `UIActivityViewController`

**Тап на адрес:**
- Открытие карты с адресом
- Действие: `viewModel.openMap(address:)`

**Тап на телефон:**
- Звонок по номеру
- Действие: `viewModel.callPhone(vet.phone)`

**Тап на email:**
- Открытие почтового клиента
- Действие: `mailto:` URL

**Тап на сайт:**
- Открытие сайта в браузере
- Действие: `viewModel.openWebsite(website)`

**Тап на кнопку "Записаться на приём":**
- Открытие формы записи (TODO)
- Переход на экран бронирования

**Swipe по карусели фото:**
- Горизонтальный swipe → переход между фото

**Тап на описание:**
- Раскрытие/сворачивание текста
- Кнопка "Читать далее" / "Свернуть"

#### 1.2.3. Валидация

**Валидация не требуется:**
- Экран информационный, пользовательский ввод отсутствует
- Все действия являются навигационными или системными

### 1.3. Техническая Реализация

#### 1.3.1. Сервисы и API

**API Endpoint: GET /medical/clinics/{id}**
- Метод: `GET`
- Путь: `/medical/clinics/{id}`
- Требует авторизации: Да (`requiresAuth: true`)
- Кэш: `cacheIfValid(600)` (10 минут)
- Retry: `exponential(maxAttempts: 3, initialDelay: 1.0)`

**Ответ при успехе (200 OK):**
```json
{
  "data": {
    "id": 1,
    "name": "ВетКлиника",
    "description": "Описание клиники",
    "rating": 4.5,
    "reviewCount": 120,
    "address": "Москва, ул. Примерная, д. 1",
    "phone": "+79001234567",
    "email": "info@vetclinic.ru",
    "website": "https://vetclinic.ru",
    "images": ["url1", "url2"],
    "workingHours": {
      "monday": {"open": "09:00", "close": "18:00", "isClosed": false},
      "tuesday": {"open": "09:00", "close": "18:00", "isClosed": false},
      "sunday": {"isClosed": true}
    },
    "services": [
      {
        "id": 1,
        "name": "Консультация",
        "description": "Общий осмотр",
        "price": 1500
      }
    ],
    "doctors": [
      {
        "id": 1,
        "name": "Иван Иванов",
        "specialization": "Хирург",
        "photo": "url",
        "experience": 10,
        "rating": 4.8
      }
    ],
    "facilities": ["Парковка", "Wi-Fi"],
    "specialties": ["Хирургия", "Терапия"]
  }
}
```

**Use Case: FetchVetProfileUseCase**
- Входные данные: `vetId: Int`
- Выходные данные: `NetworkResult<Vet>`
- Действия:
  1. Вызов `MedicalNetworkService.fetchClinic(id:)`
  2. Конвертация DTO в Entity
  3. Обновление `vet` в ViewModel

#### 1.3.2. Состояния Экрана

**Состояние: Загрузка**
- Индикатор загрузки (если реализовано)
- Placeholder для данных
- Кнопки неактивны

**Состояние: Успех**
- Все данные загружены
- Все секции отображаются
- Кнопки активны

**Состояние: Ошибка**
- Alert с сообщением об ошибке
- Если `unauthorizedError` → автоматический logout
- Возможность повторить загрузку

**Состояние: Пустое (услуги/врачи)**
- Если списки пусты → не отображаются секции
- Или отображается пустое состояние

#### 1.3.3. Навигация

**Исходящие переходы:**
- Запись на приём → экран бронирования (TODO)
- Карта → системное приложение карт
- Телефон → системный звонок
- Email → почтовый клиент
- Сайт → браузер

**Входящие переходы:**
- Из Vet List (тап на карточку клиники)
- Из других мест приложения

**Методы навигации:**
- `coordinator.goBack()` - возврат назад
- `viewModel.openMap(address:)` - открытие карты
- `viewModel.callPhone(_:)` - звонок
- `viewModel.openWebsite(_:)` - открытие сайта

#### 1.3.4. Данные

**Модель Vet:**
```swift
struct Vet: Identifiable, Codable {
    let id: Int
    let name: String
    let description: String
    let rating: Double
    let reviewCount: Int
    let address: String
    let phone: String
    let email: String?
    let website: String?
    let images: [String]
    let workingHours: WorkingHours
    let services: [VetService]
    let doctors: [VetDoctor]
    let facilities: [String]
    let specialties: [String]
}
```

**Модель WorkingHours:**
```swift
struct WorkingHours: Codable {
    let monday: DaySchedule?
    let tuesday: DaySchedule?
    let wednesday: DaySchedule?
    let thursday: DaySchedule?
    let friday: DaySchedule?
    let saturday: DaySchedule?
    let sunday: DaySchedule?
    
    struct DaySchedule: Codable {
        let open: String
        let close: String
        let isClosed: Bool
    }
}
```

**Модель VetService:**
```swift
struct VetService: Identifiable, Codable {
    let id: Int
    let name: String
    let description: String?
    let price: Double?
}
```

**Модель VetDoctor:**
```swift
struct VetDoctor: Identifiable, Codable {
    let id: Int
    let name: String
    let specialization: String
    let photo: String?
    let experience: Int?
    let rating: Double?
}
```

**Состояние ViewModel:**
- `vet: Vet?` - данные клиники

#### 1.3.5. Обработка Ошибок

**Типы ошибок:**
- **Неавторизован (401):** Автоматический logout
- **Не найдено (404):** Сообщение "Клиника не найдена"
- **Сервер (500):** Общая ошибка сервера
- **Сеть:** Ошибка подключения

**Стратегия обработки:**
- Ошибки логируются с контекстом `["action": "load_vet_profile", "vet_id": vetId]`
- Пользователь может повторить загрузку

#### 1.3.6. Аналитика

**Отслеживаемые события:**
- `screen_view: VetProfile` - при появлении экрана
- `vet_profile_loaded` - при успешной загрузке (параметры: `vet_id`)
- `vet_contact_opened` - при открытии контакта (параметры: `contact_type`: "phone"|"email"|"website"|"map")
- `vet_appointment_opened` - при открытии формы записи (параметры: `vet_id`)
- `vet_shared` - при шаринге профиля (параметры: `vet_id`)

---

**Документ подготовлен:** Business & Systems Analyst  
**Дата последнего обновления:** 2025-01-XX  
**Версия:** 1.0

