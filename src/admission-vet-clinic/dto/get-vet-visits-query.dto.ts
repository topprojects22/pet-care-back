import { IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class GetVetVisitsQueryDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  clinicId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string; // Алиас для startDate

  @IsOptional()
  @IsDateString()
  toDate?: string; // Алиас для endDate

  @IsOptional()
  @Type(() => String)
  sortBy?: 'visitDate' | 'createdAt' | 'cost';

  @IsOptional()
  @Type(() => String)
  sortOrder?: 'asc' | 'desc';
}

