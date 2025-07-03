import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsString,
} from "class-validator";

// create-vaccination.dto.ts
export class CreateVaccinationDto {
  @IsNumber()
  @IsNotEmpty()
  petId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsDate()
  @IsNotEmpty()
  date: Date;

  @IsOptional()
  @IsDate()
  nextDate?: Date;

  @IsOptional()
  @IsNumber()
  clinicId?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
