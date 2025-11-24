# Спецификация Пользовательского Интерфейса для MVP
## Часть 2.6: Edit Pet Passport

**Версия:** 1.0  
**Дата:** 2025-01-XX  
**Статус:** Draft

---

## 1. Edit Pet Passport

### 1.1. Цель и Контекст

**Бизнес-задача:** Редактирование ветеринарного паспорта питомца: обновление основной информации, внешних характеристик и контактов владельца. Создание нового паспорта, если его еще нет.

**Место в сценарии:** Отображается из Pet Passport (иконка редактирования) или при создании нового паспорта. После сохранения данные обновляются в паспорте питомца.

**Ключевые функции:** Редактирование данных, загрузка фото, валидация формы, сохранение изменений.

### 1.2. Элементы Интерфейса и Функциональность

#### 1.2.1. Структура Экрана

**Компонент: TitleTopWidget (Header)**
- Заголовок:
  - "Создать паспорт" (если `initialPassport == nil`)
  - "Редактировать паспорт" (если `initialPassport != nil`)
- Левая иконка: Стрелка назад (`left-arrow-20`)
  - Действие: `viewModel.navigateBack()`
- Отступы: Горизонтальные 20 points, верхний 8 points

**Секция "Фото" (photoSection):**
- Позиция: Верх ScrollView, центрировано
- **Если фото выбрано:**
  - Изображение: Круглое, размер 140x140 points
  - Обводка: Цвет primary, толщина 3 points
  - Тень: Радиус 8, смещение (0, 4)
  - Кнопка редактирования: Иконка камеры в правом нижнем углу
    - Размер: 36x36 points
    - Фон: Primary color
    - Действие: Открытие выбора фото
- **Если фото не выбрано:**
  - Кнопка: Круглая, размер 140x140 points
  - Иконка: `camera.fill`, размер 32 points
  - Текст: "Добавить фото"
  - Фон: Surface color
  - Обводка: Пунктирная, цвет border
  - Действие: Открытие выбора фото

**Модальное окно выбора фото:**
- Компонент: `PhotoPickerSheet`
- Тип: Sheet
- Действие: Выбор фото из галереи или камеры

**Секция "Основная информация":**
- Заголовок секции: "Основная информация" (18pt, semibold)
- Поле "Имя питомца":
  - Компонент: `TextFieldUI`
  - Placeholder: "Имя питомца"
  - Иконка: `pawprint.fill`
  - Привязка: `$viewModel.name`
  - Ошибка: `viewModel.nameError`
  - Конфигурация: `.name`
  - Валидация: Обязательное поле
- Выбор вида животного (speciesPicker):
  - Компонент: Кастомный picker с кнопками
  - Варианты:
    - **Собака:** Иконка `pawprint.fill`
    - **Кошка:** Иконка `pawprint.fill`
    - **Другое:** Иконка `questionmark.circle.fill`
  - Визуализация:
    - Выбранный: Белый текст, primary фон, обводка primary
    - Невыбранный: Обычный текст, surface фон, обводка border
  - Привязка: `$viewModel.species`
- Поле "Порода":
  - Компонент: `TextFieldUI`
  - Placeholder: "Порода"
  - Иконка: `tag.fill`
  - Привязка: `$viewModel.breed`
  - Ошибка: `viewModel.breedError`
  - Валидация: Обязательное поле
- Поле "Дата рождения":
  - Компонент: `DatePickerUI`
  - Заголовок: "Дата рождения"
  - Привязка: `$viewModel.birthDate`
  - Иконка: `calendar`
  - Конфигурация:
    - Mode: `.date`
    - MaxDate: `Date()` (нельзя выбрать будущую дату)
- Поле "Вес":
  - Компонент: `TextFieldUI`
  - Placeholder: "Вес (кг)"
  - Иконка: `scalemass.fill`
  - Привязка: `$viewModel.weight`
  - Ошибка: `viewModel.weightError`
  - Конфигурация: `.decimalPad` (клавиатура с числами)
  - Валидация: Если указан, должен быть положительным числом
- Отступы: Горизонтальные 20 points

**Секция "Внешние характеристики":**
- Заголовок секции: "Внешние характеристики" (18pt, semibold)
- Поле "Окрас":
  - Компонент: `TextFieldUI`
  - Placeholder: "Окрас"
  - Иконка: `paintpalette.fill`
  - Привязка: `$viewModel.color`
  - Ошибка: `nil` (необязательное поле)
- Поле "Особые приметы":
  - Компонент: `TextAreaUI`
  - Placeholder: "Особые приметы (необязательно)"
  - Привязка: `$viewModel.distinctiveFeatures`
  - Минимальная высота: 100 points
  - Максимальная длина: 500 символов
- Отступы: Горизонтальные 20 points

**Секция "Контакты владельца":**
- Заголовок секции: "Контакты владельца" (18pt, semibold)
- Поле "Имя владельца":
  - Компонент: `TextFieldUI`
  - Placeholder: "Имя владельца"
  - Иконка: `person.fill`
  - Привязка: `$viewModel.ownerName`
  - Ошибка: `viewModel.ownerNameError`
  - Конфигурация: `.name`
  - Валидация: Обязательное поле
- Поле "Телефон":
  - Компонент: `TextFieldUI`
  - Placeholder: "Телефон"
  - Иконка: `phone.fill`
  - Привязка: `$viewModel.ownerPhone`
  - Ошибка: `viewModel.ownerPhoneError`
  - Конфигурация:
    - KeyboardType: `.phonePad`
    - TextContentType: `.telephoneNumber`
  - Валидация: Обязательное поле, формат телефона
- Отступы: Горизонтальные 20 points

**Кнопка "Создать паспорт" / "Сохранить изменения":**
- Компонент: `ButtonUI`
- Стиль: Primary button, размер large
- Текст:
  - "Создать паспорт" (если `initialPassport == nil`)
  - "Сохранить изменения" (если `initialPassport != nil`)
- Действие: `viewModel.savePassport()`
- Состояния:
  - Неактивна: Во время загрузки (`isLoading`)
  - Загрузка: Показывает индикатор загрузки
- Отступы: Горизонтальные 20 points, верхний 8 points, нижний 40 points

#### 1.2.2. Интерактивность

**Выбор фото:**
- Тап на кнопку/изображение → открытие модального окна
- Выбор из галереи или камеры
- После выбора → обновление `photoImage` и `photoData`
- Аналитика: `pet_passport_photo_selected`

**Ввод данных:**
- Реакция на изменение: Валидация в реальном времени
- Ошибки отображаются под полями
- Автозаполнение: Поддержка системного автозаполнения

**Выбор вида животного:**
- Тап на кнопку → обновление `species`
- Анимация: Spring animation
- Визуальное выделение выбранного

**Выбор даты:**
- Тап на поле → открытие DatePicker
- Ограничение: Нельзя выбрать будущую дату

**Тап на кнопку "Создать/Сохранить":**
- Валидация всех полей
- Если валидно: Отправка запроса на сервер
- Если невалидно: Отображение ошибок

**Тап на стрелку назад:**
- Возврат на предыдущий экран
- Данные не сохраняются (если не было сохранения)

#### 1.2.3. Валидация Данных

**Имя питомца:**
- Обязательное поле
- Не может быть пустым (после trim)
- Сообщение об ошибке: "Имя питомца обязательно"

**Вид животного:**
- Обязательное поле
- Должен быть выбран один из вариантов
- Валидация не требуется (всегда есть значение по умолчанию)

**Порода:**
- Обязательное поле
- Не может быть пустым (после trim)
- Сообщение об ошибке: "Порода обязательна"

**Дата рождения:**
- Не может быть в будущем
- Валидация на клиенте: `maxDate: Date()`

**Вес:**
- Необязательное поле
- Если указан: Должен быть положительным числом (Double > 0)
- Сообщение об ошибке: "Введите корректный вес"

**Окрас:**
- Необязательное поле
- Валидация не требуется

**Особые приметы:**
- Необязательное поле
- Максимальная длина: 500 символов

**Имя владельца:**
- Обязательное поле
- Не может быть пустым (после trim)
- Сообщение об ошибке: "Имя владельца обязательно"

**Телефон:**
- Обязательное поле
- Формат: Стандартный формат телефона
- Сообщение об ошибке: "Введите корректный телефон"

**Валидация на клиенте:**
- Проверка всех обязательных полей
- Проверка формата данных (вес, телефон, дата)
- Отображение ошибок под полями

**Валидация на сервере:**
- Дополнительная проверка данных
- Проверка уникальности (если требуется)

### 1.3. Техническая Реализация

#### 1.3.1. Сервисы и API

**API Endpoint: POST /pet/{petId}/passport**
- Метод: `POST`
- Путь: `/pet/{petId}/passport`
- Требует авторизации: Да
- Тело запроса:
```json
{
  "petName": "Луна",
  "species": "Собака",
  "breed": "Бигль",
  "birthDate": "2014-01-01",
  "weight": 12.5,
  "color": "серый",
  "distinctiveFeatures": "серый, игривый",
  "ownerName": "Иван Иванов",
  "ownerPhone": "+79001234567"
}
```

**API Endpoint: PUT /pet/{petId}/passport**
- Метод: `PUT`
- Путь: `/pet/{petId}/passport`
- Требует авторизации: Да
- Тело запроса: Аналогично POST

**Use Case: CreatePetPassportUseCase / UpdatePetPassportUseCase**
- Входные данные: `CreatePetPassportRequest` / `UpdatePetPassportRequest`
- Выходные данные: `NetworkResult<PetPassport>`
- Действия:
  1. Валидация данных
  2. Создание/обновление DTO
  3. Вызов `PetNetworkService.createPassport()` / `updatePassport()`
  4. Конвертация DTO в Entity
  5. Возврат обновленного паспорта

**Загрузка фото (опционально):**
- Endpoint: `POST /pets/{petId}/photos/upload`
- Use Case: `UploadPetPhotoUseCase`
- Действие: Загрузка фото после сохранения паспорта

#### 1.3.2. Состояния Экрана

**Состояние: Инициализация (создание)**
- Поля пустые или с дефолтными значениями
- `species`: "Собака" (по умолчанию)
- `birthDate`: Текущая дата минус 1 год
- `photoImage`: `nil`
- `initialPassport`: `nil`

**Состояние: Инициализация (редактирование)**
- Поля заполнены данными из `initialPassport`
- `name`: `passport.name`
- `species`: `passport.species`
- `breed`: `passport.breed`
- `birthDate`: `passport.birthDate`
- `weight`: `String(passport.weight)`
- `color`: `passport.color`
- `distinctiveFeatures`: `passport.distinctiveFeatures`
- `ownerName`: `passport.ownerName`
- `ownerPhone`: `passport.ownerPhone`
- `photoImage`: Загружается из `passport.avatarImageData`

**Состояние: Загрузка**
- `isLoading = true`
- Кнопка показывает индикатор загрузки
- Все поля заблокированы
- Кнопка неактивна

**Состояние: Успех**
- Alert: "Паспорт успешно создан!" / "Изменения сохранены!"
- Автоматическое обновление данных в Pet Passport
- Возврат на предыдущий экран (опционально)

**Состояние: Ошибка**
- Alert с сообщением об ошибке
- Ошибки валидации под полями
- Кнопка снова активна
- Возможность повторить

#### 1.3.3. Навигация

**Исходящие переходы:**
- После успешного сохранения → возврат на Pet Passport
- При отмене → возврат на Pet Passport

**Входящие переходы:**
- Из Pet Passport (иконка редактирования)
- С параметрами: `petId` и `passport` (опционально)

**Методы навигации:**
- `coordinator.goBack()` - возврат назад
- Модальное окно через `sheet` (из Pet Passport)

#### 1.3.4. Данные

**Состояние ViewModel:**
```swift
@Published var name: String = ""
@Published var species: String = "Собака"
@Published var breed: String = ""
@Published var birthDate: Date = Calendar.current.date(byAdding: .year, value: -1, to: Date()) ?? Date()
@Published var weight: String = ""
@Published var color: String = ""
@Published var distinctiveFeatures: String = ""
@Published var ownerName: String = ""
@Published var ownerPhone: String = ""
@Published var photoData: Data?
@Published var photoImage: Image?
@Published var showSuccess = false

// Ошибки валидации
@Published var nameError: String?
@Published var breedError: String?
@Published var weightError: String?
@Published var ownerNameError: String?
@Published var ownerPhoneError: String?
```

**Модель CreatePetPassportRequest:**
```swift
struct CreatePetPassportRequest {
    let petId: Int
    let petName: String
    let species: String
    let breed: String
    let birthDate: Date
    let weight: Double?
    let color: String?
    let distinctiveFeatures: String?
    let ownerName: String
    let ownerPhone: String
    let photoData: Data?
}
```

#### 1.3.5. Обработка Ошибок

**Типы ошибок:**
- **Валидация (400):** Неверный формат данных
- **Неавторизован (401):** Автоматический logout
- **Не найдено (404):** Питомец не найден
- **Сервер (500):** Общая ошибка сервера
- **Сеть:** Ошибка подключения

**Стратегия обработки:**
- Ошибки валидации: Отображаются под полями
- Ошибки сервера: Alert с сообщением
- Ошибки логируются с контекстом `["action": "save_pet_passport", "pet_id": petId]`

#### 1.3.6. Аналитика

**Отслеживаемые события:**
- `screen_view: EditPetPassport` - при появлении экрана
- `pet_passport_photo_selected` - при выборе фото
- `pet_passport_created` - при создании паспорта (параметры: `pet_id`)
- `pet_passport_updated` - при обновлении паспорта (параметры: `pet_id`)
- `pet_passport_save_cancelled` - при отмене редактирования

---

**Документ подготовлен:** Business & Systems Analyst  
**Дата последнего обновления:** 2025-01-XX  
**Версия:** 1.0

