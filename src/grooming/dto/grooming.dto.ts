import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

// create-grooming-booking.dto.ts
export class CreateGroomingBookingDto {
  @IsNumber()
  @IsNotEmpty()
  petId!: number;

  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsDate()
  @IsNotEmpty()
  date!: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  serviceType!: string;
}

// grooming-service.dto.ts
export class GroomingServiceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price!: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(10)
  duration!: number;
}
