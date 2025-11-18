# Примеры использования новых компонентов

## 📚 Содержание

1. [Декораторы](#декораторы)
2. [Guards](#guards)
3. [Базовые классы](#базовые-классы)
4. [Обработка ошибок](#обработка-ошибок)
5. [Валидация](#валидация)
6. [Утилиты](#утилиты)

---

## Декораторы

### @CurrentUser()

Получение текущего пользователя из запроса:

```typescript
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Get('profile')
@Auth()
async getProfile(@CurrentUser() user: User) {
  return user;
}
```

### @Public()

Пометка публичных endpoints (без аутентификации):

```typescript
import { Public } from '../common/decorators/public.decorator';

@Public()
@Get('public-data')
async getPublicData() {
  return { message: 'This is public' };
}
```

### @Resource()

Указание типа ресурса для проверки владения:

```typescript
import { Resource } from '../common/decorators/resource.decorator';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { UseGuards } from '@nestjs/common';

@Put(':id')
@Auth()
@Resource('pet')
@UseGuards(OwnershipGuard)
async updatePet(@Param('id') id: string, @Body() data: UpdatePetDto) {
  return this.petService.update(+id, data);
}
```

---

## Guards

### OwnershipGuard

Проверка владения ресурсом:

```typescript
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { Resource } from '../common/decorators/resource.decorator';

@Controller('pets')
export class PetController {
  @Delete(':id')
  @Auth()
  @Resource('pet')
  @UseGuards(OwnershipGuard)
  async deletePet(@Param('id') id: string) {
    // Пользователь может удалить только своих питомцев
    return this.petService.delete(+id);
  }
}
```

---

## Базовые классы

### BaseCrudService

Использование базового CRUD сервиса:

```typescript
import { Injectable } from '@nestjs/common';
import { BaseCrudService } from '../common/services/base-crud.service';
import { PrismaService } from '../prisma.service';
import { CreateMedicationDto, UpdateMedicationDto } from './dto/medication.dto';
import { Medication } from '@prisma/client';

@Injectable()
export class MedicationService extends BaseCrudService<
  Medication,
  CreateMedicationDto,
  UpdateMedicationDto
> {
  constructor(prisma: PrismaService) {
    super(prisma, 'medication');
  }

  // Дополнительные методы специфичные для Medication
  async findByPetId(petId: number) {
    return this.prisma.medication.findMany({
      where: { petId },
    });
  }
}
```

---

## Обработка ошибок

### Business Exceptions

Использование бизнес-исключений:

```typescript
import { 
  ResourceNotFoundException,
  ConflictException,
  ValidationException,
  ForbiddenResourceException 
} from '../common/exceptions/business.exception';

@Injectable()
export class PetService {
  async getPet(id: number) {
    const pet = await this.prisma.pet.findUnique({ where: { id } });
    
    if (!pet) {
      throw new ResourceNotFoundException('Pet', id);
    }
    
    return pet;
  }

  async createPet(data: CreatePetDto, userId: number) {
    // Проверка на дублирование
    const existing = await this.prisma.pet.findFirst({
      where: { name: data.name, userId },
    });
    
    if (existing) {
      throw new ConflictException('Pet with this name already exists');
    }

    // Валидация бизнес-правил
    if (data.birthDate && data.birthDate > new Date()) {
      throw new ValidationException('Birth date cannot be in the future');
    }

    return this.prisma.pet.create({ data: { ...data, userId } });
  }

  async updatePet(id: number, data: UpdatePetDto, userId: number) {
    const pet = await this.getPet(id);
    
    if (pet.userId !== userId) {
      throw new ForbiddenResourceException('pet');
    }

    return this.prisma.pet.update({ where: { id }, data });
  }
}
```

---

## Валидация

### Кастомные валидаторы

Использование валидатора пароля:

```typescript
import { IsEmail, IsString } from 'class-validator';
import { IsStrongPassword } from '../common/validators/password.validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsStrongPassword()
  password: string;
}
```

### Пагинация

Использование PaginationDto:

```typescript
import { PaginationDto } from '../common/dto/pagination.dto';

@Get()
@Auth()
async findAll(@Query() pagination: PaginationDto) {
  return this.service.findAll(pagination);
}
```

---

## Утилиты

### Retry

Повторные попытки при ошибках:

```typescript
import { retry } from '../common/utils/retry.util';

async fetchExternalData() {
  return retry(
    async () => {
      const response = await fetch('https://api.example.com/data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: 'exponential',
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}:`, error.message);
      },
    }
  );
}
```

### Sanitize

Очистка пользовательского ввода:

```typescript
import { sanitizeHtml, sanitizeText, sanitizeUrl } from '../common/utils/sanitize.util';

// Очистка HTML
const cleanHtml = sanitizeHtml(userInput);

// Очистка текста
const cleanText = sanitizeText(userInput);

// Валидация URL
const validUrl = sanitizeUrl(userInput);
if (!validUrl) {
  throw new ValidationException('Invalid URL');
}
```

---

## Полный пример контроллера

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Resource } from '../common/decorators/resource.decorator';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ResourceNotFoundException } from '../common/exceptions/business.exception';
import { User } from '@prisma/client';
import { PetService } from './pet.service';
import { CreatePetDto, UpdatePetDto } from './dto/pet.dto';

@ApiTags('Pets')
@ApiBearerAuth('JWT-auth')
@Controller('pets')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'Get all user pets' })
  async getUserPets(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ) {
    return this.petService.getUserPets(user.id, pagination);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get pet by ID' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async getPet(@Param('id') id: string) {
    const pet = await this.petService.getPetWithDetails(+id);
    if (!pet) {
      throw new ResourceNotFoundException('Pet', +id);
    }
    return pet;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new pet' })
  async createPet(
    @Body() data: CreatePetDto,
    @CurrentUser() user: User,
  ) {
    return this.petService.createPet(data, user.id);
  }

  @Put(':id')
  @Auth()
  @Resource('pet')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Update pet' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async updatePet(
    @Param('id') id: string,
    @Body() data: UpdatePetDto,
  ) {
    return this.petService.updatePet(+id, data);
  }

  @Delete(':id')
  @Auth()
  @Resource('pet')
  @UseGuards(OwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete pet' })
  async deletePet(@Param('id') id: string) {
    await this.petService.deletePet(+id);
  }
}
```

---

## Рекомендации

1. **Всегда используйте @CurrentUser()** вместо `@Req() req` для получения пользователя
2. **Используйте Business Exceptions** для ошибок бизнес-логики
3. **Применяйте OwnershipGuard** для защиты ресурсов
4. **Используйте PaginationDto** для всех списков
5. **Валидируйте пароли** с помощью @IsStrongPassword()
6. **Санитизируйте пользовательский ввод** перед сохранением

