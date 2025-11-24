import { IsOptional, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetPetsQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  type?: string; // Фильтр по типу животного (dog, cat, bird)

  @IsOptional()
  @IsEnum(['name', 'createdAt', 'birthDate'])
  sort?: 'name' | 'createdAt' | 'birthDate';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  order?: 'asc' | 'desc';
}

