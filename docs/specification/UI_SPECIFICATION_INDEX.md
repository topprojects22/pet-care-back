# Индекс Спецификаций Пользовательского Интерфейса

**Версия:** 1.0  
**Дата:** 2025-01-XX  
**Статус:** Draft

---

## Обзор

Этот документ является индексом всех спецификаций пользовательского интерфейса для приложения PetCare. Спецификации организованы по частям и модулям для удобной навигации.

---

## Структура Спецификаций

### Часть 1: Начальный Flow
**Файл:** `UI_SPECIFICATION_PART1.md`

Покрывает начальный flow приложения от запуска до получения доступа к основному функционалу:

1. **Splash Screen** - Экран загрузки и инициализации
2. **Onboarding** - Знакомство с приложением (3 карточки)
3. **Authorization (Login)** - Авторизация существующих пользователей
4. **Registration** - Регистрация новых пользователей
5. **Subscription** - Оформление премиум-подписки

---

### Часть 2: Основные Экраны

#### 2.1: Home и Pet List
**Файл:** `UI_SPECIFICATION_PART2_HOME_PETLIST.md`

1. **Home Screen** - Главный экран с каруселью и событиями
2. **Pet List** - Список питомцев пользователя

#### 2.2: Pet Profile и Passport
**Файл:** `UI_SPECIFICATION_PART2_PET_PROFILE_PASSPORT_CREATE.md`

1. **Pet Profile** - Детальный профиль питомца
2. **Pet Passport** - Ветеринарный паспорт с QR-кодом
3. **Create Pet** - Создание нового питомца

#### 2.3: Calendar, Notifications, Profile
**Файл:** `UI_SPECIFICATION_PART2_CALENDAR_NOTIFICATIONS_PROFILE.md`

1. **Calendar** - Календарь событий питомца
2. **Notifications** - Уведомления
3. **Profile** - Профиль пользователя
4. **Forgot Password** - Восстановление пароля
5. **Verification** - Подтверждение email

#### 2.4: Add Event
**Файл:** `UI_SPECIFICATION_PART2_ADD_EVENT.md`

1. **Add Event** - Создание и редактирование событий в календаре

#### 2.5: Edit Pet Passport
**Файл:** `UI_SPECIFICATION_PART2_EDIT_PET_PASSPORT.md`

1. **Edit Pet Passport** - Редактирование ветеринарного паспорта

#### 2.6: Vet List
**Файл:** `UI_SPECIFICATION_PART2_VET_LIST.md`

1. **Vet List** - Список ветеринарных клиник

#### 2.7: Vet Profile
**Файл:** `UI_SPECIFICATION_PART2_VET_PROFILE.md`

1. **Vet Profile** - Детальная информация о ветеринарной клинике
2. **Appointment Booking** - Бронирование приема

#### 2.8: Cart
**Файл:** `UI_SPECIFICATION_PART2_CART.md`

1. **Cart** - Корзина товаров и услуг

---

### Часть 3: Расширенные Модули

#### 3.1: Финансовый Хаб
**Файл:** `UI_SPECIFICATION_PART3_PAYMENT_TRANSACTIONS.md`

1. **Payment Screen** - Оплата услуг с выбором метода оплаты
2. **Transaction History** - История всех финансовых транзакций

#### 3.2: Социальная Сеть
**Файл:** `UI_SPECIFICATION_PART3_SOCIAL_NETWORK.md`

1. **Social Feed** - Лента публикаций сообщества
2. **Post Detail** - Детальный просмотр публикации с комментариями
3. **Create Post** - Создание новой публикации
4. **User Profile** - Профиль пользователя в социальной сети
5. **Hashtag Feed** - Лента публикаций по хештегу

#### 3.3: Модуль Благотворительности
**Файл:** `UI_SPECIFICATION_PART3_CHARITY.md`

1. **Shelter List** - Каталог приютов для животных
2. **Shelter Detail** - Детальная информация о приюте
3. **Pet Adoption** - Усыновление питомца из приюта
4. **Boarding Search** - Поиск передержек для питомцев
5. **Donation** - Пожертвование приютам

#### 3.4: События и Геймификация
**Файл:** `UI_SPECIFICATION_PART3_EVENTS_GAMIFICATION.md`

1. **Events Catalog** - Каталог мероприятий (выставки, спорт, вебинары)
2. **Event Detail** - Детальная информация о событии
3. **Event Registration** - Регистрация на событие
4. **Achievements** - Система достижений и бейджей
5. **Leaderboard** - Таблица лидеров

#### 3.5: Настройки
**Файл:** `UI_SPECIFICATION_PART3_SETTINGS.md`

1. **Edit Profile** - Редактирование профиля пользователя
2. **Language Settings** - Настройки языка интерфейса
3. **Feedback** - Форма обратной связи
4. **Delivery Address** - Управление адресами доставки

---

## Матрица Покрытия Экранов

### Начальный Flow ✅
- [x] Splash Screen
- [x] Onboarding
- [x] Authorization (Login)
- [x] Registration
- [x] Verification
- [x] Forgot Password
- [x] Subscription

### Основные Экраны ✅
- [x] Home Screen
- [x] Pet List
- [x] Pet Profile
- [x] Pet Passport
- [x] Create Pet
- [x] Edit Pet Passport
- [x] Calendar
- [x] Add Event
- [x] Notifications
- [x] Profile

### Marketplace ✅
- [x] Vet List
- [x] Vet Profile
- [x] Appointment Booking
- [x] Cart

### Финансовый Хаб ✅
- [x] Payment Screen
- [x] Transaction History

### Социальная Сеть ✅
- [x] Social Feed
- [x] Post Detail
- [x] Create Post
- [x] User Profile (Social)
- [x] Hashtag Feed

### Благотворительность ✅
- [x] Shelter List
- [x] Shelter Detail
- [x] Pet Adoption
- [x] Boarding Search
- [x] Donation

### События и Геймификация ✅
- [x] Events Catalog
- [x] Event Detail
- [x] Event Registration
- [x] Achievements
- [x] Leaderboard

### Настройки ✅
- [x] Edit Profile
- [x] Language Settings
- [x] Feedback
- [x] Delivery Address

---

## Навигация по Модулям

### По Бизнес-Модулям (из INFO.md)

#### 1. Цифровой паспорт и менеджер здоровья
- **Спецификации:**
  - `UI_SPECIFICATION_PART2_PET_PROFILE_PASSPORT_CREATE.md` - Pet Profile, Pet Passport, Create Pet
  - `UI_SPECIFICATION_PART2_EDIT_PET_PASSPORT.md` - Edit Pet Passport
  - `UI_SPECIFICATION_PART2_CALENDAR_NOTIFICATIONS_PROFILE.md` - Calendar, Add Event
- **Экраны:** Pet Profile, Pet Passport, Calendar, Add Event, Edit Pet Passport

#### 2. Платформа для бронирования услуг (Marketplace)
- **Спецификации:**
  - `UI_SPECIFICATION_PART2_VET_LIST.md` - Vet List
  - `UI_SPECIFICATION_PART2_VET_PROFILE.md` - Vet Profile, Appointment Booking
  - `UI_SPECIFICATION_PART2_CART.md` - Cart
- **Экраны:** Vet List, Vet Profile, Appointment Booking, Cart

#### 3. Социальная сеть и сообщество (Pet-Instagram)
- **Спецификация:** `UI_SPECIFICATION_PART3_SOCIAL_NETWORK.md`
- **Экраны:** Social Feed, Post Detail, Create Post, User Profile, Hashtag Feed

#### 4. Модуль благотворительности
- **Спецификация:** `UI_SPECIFICATION_PART3_CHARITY.md`
- **Экраны:** Shelter List, Shelter Detail, Pet Adoption, Boarding Search, Donation

#### 5. События и геймификация
- **Спецификация:** `UI_SPECIFICATION_PART3_EVENTS_GAMIFICATION.md`
- **Экраны:** Events Catalog, Event Detail, Event Registration, Achievements, Leaderboard

#### 6. Финансовый хаб
- **Спецификация:** `UI_SPECIFICATION_PART3_PAYMENT_TRANSACTIONS.md`
- **Экраны:** Payment Screen, Transaction History

---

## Структура Каждой Спецификации

Каждая спецификация следует единой структуре:

1. **Цель и Контекст**
   - Бизнес-задача
   - Место в сценарии
   - Ключевые функции

2. **Элементы Интерфейса и Функциональность**
   - Структура экрана
   - Компоненты UI
   - Интерактивность
   - Валидация

3. **Техническая Реализация**
   - Сервисы и API
   - Use Cases
   - Состояния экрана
   - Навигация
   - Данные
   - Обработка ошибок
   - Аналитика

---

## Использование Спецификаций

### Для Разработчиков
1. Найдите нужный экран в индексе
2. Откройте соответствующую спецификацию
3. Изучите структуру экрана и компоненты
4. Реализуйте согласно техническим требованиям

### Для Дизайнеров
1. Используйте спецификации для понимания структуры экранов
2. Проверяйте соответствие дизайна спецификациям
3. Уточняйте детали интерфейса

### Для Тестировщиков
1. Используйте спецификации для составления тест-кейсов
2. Проверяйте все состояния экранов
3. Тестируйте навигацию и интерактивность

### Для Аналитиков
1. Проверяйте покрытие бизнес-требований
2. Отслеживайте аналитические события
3. Валидируйте user flow

---

## Версионирование

- **Версия 1.0** - Начальная версия спецификаций
- Все спецификации имеют статус "Draft"
- Обновления вносятся по мере разработки

---

## Контакты

**Документ подготовлен:** Business & Systems Analyst  
**Дата последнего обновления:** 2025-01-XX  
**Версия:** 1.0

---

## Примечания

- Все спецификации следуют архитектуре Clean Architecture (MVVM)
- Используются Use Cases для бизнес-логики
- Навигация через AppCoordinator
- Все экраны используют BaseViewModel
- Дизайн-система описана в `docs/design_system/`

---

**Последнее обновление:** 2025-01-XX

