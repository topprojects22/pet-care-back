import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsBoolean,
  Min,
  Max,
  IsArray,
} from "class-validator";

// create-appointment.dto.ts
export class CreateAppointmentDto {
  @IsNumber()
  @IsNotEmpty()
  petId!: number;

  @IsNumber()
  @IsNotEmpty()
  clinicId!: number;

  @IsString()
  @IsNotEmpty()
  procedure!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  recomendation!: string;

  @IsDate()
  @IsNotEmpty()
  visitDate!: Date;

  @IsOptional()
  @IsDate()
  nextVisitDate?: Date;

  @IsOptional()
  @IsString()
  doctorName?: string;

  @IsOptional()
  @IsString()
  medications?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  files?: string[];

  @IsNumber()
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @IsOptional()
  pulse?: number;

  @IsNumber()
  @IsOptional()
  respiration?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  status?: string[];

  @IsString()
  @IsOptional()
  anesthesia?: string;

  @IsString()
  @IsOptional()
  complications?: string;
}

// ClinicSearchDto moved to separate file: clinic-search.dto.ts
