# Рекомендации по добавлению индексов в Prisma схему

## Критичные индексы для производительности

Добавьте следующие индексы в `prisma/schema.prisma` для улучшения производительности запросов:

### User модель
```prisma
model User {
  // ... существующие поля
  
  @@index([email]) // Уже есть unique, но можно добавить для явности
  @@index([roleId])
  @@index([createdAt])
}
```

### Pet модель
```prisma
model Pet {
  // ... существующие поля
  
  @@index([userId])
  @@index([animalTypeId])
  @@index([createdAt])
  @@index([userId, createdAt]) // Составной индекс для частых запросов
}
```

### Notification модель
```prisma
model Notification {
  // ... существующие поля
  
  @@index([userId])
  @@index([type])
  @@index([isCompleted])
  @@index([userId, isCompleted]) // Составной индекс
  @@index([expiriedAt])
}
```

### Payment модель
```prisma
model Payment {
  // ... существующие поля
  
  @@index([userId])
  @@index([status])
  @@index([paymentDate])
  @@index([userId, status]) // Составной индекс
}
```

### PetBoardingBooking модель
```prisma
model PetBoardingBooking {
  // ... существующие поля
  
  @@index([userId])
  @@index([petId])
  @@index([boardingId])
  @@index([status])
  @@index([startDate, endDate]) // Для поиска по датам
}
```

### CommunityPost модель
```prisma
model CommunityPost {
  // ... существующие поля
  
  @@index([authorId])
  @@index([shelterId])
  @@index([postType])
  @@index([createdAt])
  @@index([isPinned, createdAt]) // Для сортировки закрепленных постов
}
```

### AdmissionVetClinic модель
```prisma
model AdmissionVetClinic {
  // ... существующие поля
  
  @@index([petId])
  @@index([clinicId])
  @@index([visitDate])
  @@index([petId, visitDate]) // Составной индекс
}
```

### Vaccination модель
```prisma
model Vaccination {
  // ... существующие поля
  
  @@index([petId])
  @@index([date])
  @@index([petId, date]) // Составной индекс
}
```

### Medication модель
```prisma
model Medication {
  // ... существующие поля
  
  @@index([petId])
  @@index([startDate])
  @@index([endDate])
}
```

## Как применить

1. Добавьте индексы в `prisma/schema.prisma`
2. Выполните миграцию: `npx prisma migrate dev --name add_indexes`
3. Или сгенерируйте клиент: `npx prisma generate`

## Примечания

- Индексы улучшают производительность чтения, но замедляют запись
- Не создавайте слишком много индексов на одной таблице
- Мониторьте производительность после добавления индексов
- Используйте составные индексы для частых комбинаций условий WHERE

