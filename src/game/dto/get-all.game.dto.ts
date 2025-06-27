import { PaginationDto } from '../../pagination/dto/pagination.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum EnumGameSort {
  START_DATE = 'start-date',
  END_DATE = 'end-rice',
}

export class GetAllGameDto extends PaginationDto {
  @IsOptional()
  @IsEnum(EnumGameSort)
  sort?: EnumGameSort;

  @IsOptional()
  @IsString()
  searchItem?: string;
}
