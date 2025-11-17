import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { PaginationDto, PaginatedResponseDto } from '../dto/pagination.dto';

/**
 * Базовый CRUD сервис для переиспользования
 * Предоставляет стандартные методы для работы с ресурсами
 */
@Injectable()
export abstract class BaseCrudService<T, CreateDto, UpdateDto> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string,
  ) {}

  /**
   * Создание новой записи
   */
  async create(data: CreateDto): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any)[this.modelName].create({
      data,
    }) as Promise<T>;
  }

  /**
   * Получение всех записей с пагинацией
   */
  async findAll(
    pagination: PaginationDto,
    where?: Record<string, unknown>,
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any)[this.modelName].findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }) as Promise<T[]>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.prisma as any)[this.modelName].count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Получение записи по ID
   */
  async findOne(id: number): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any)[this.modelName].findUnique({
      where: { id },
    }) as Promise<T | null>;
  }

  /**
   * Обновление записи
   */
  async update(id: number, data: UpdateDto): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any)[this.modelName].update({
      where: { id },
      data,
    }) as Promise<T>;
  }

  /**
   * Удаление записи
   */
  async remove(id: number): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.prisma as any)[this.modelName].delete({
      where: { id },
    }) as Promise<T>;
  }
}

