import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../constants';

/**
 * Базовый DTO для пагинации
 * Используется во всех запросах, требующих пагинацию
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;
}

/**
 * Ответ с пагинацией
 */
export class PaginatedResponseDto<T> {
  data!: T[];
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

