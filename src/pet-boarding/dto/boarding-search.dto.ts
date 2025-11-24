import { IsOptional, IsString, IsNumber, Min, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class BoardingSearchDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  acceptsCats?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  acceptsDogs?: boolean;

  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}

