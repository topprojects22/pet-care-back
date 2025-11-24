import { IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetVaccinationsQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Boolean)
  includeFuture?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  upcoming?: boolean; // Только предстоящие вакцинации

  @IsOptional()
  @Type(() => Boolean)
  overdue?: boolean; // Только просроченные

  @IsOptional()
  @IsString()
  sortBy?: 'date' | 'nextDate' | 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

