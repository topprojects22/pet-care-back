import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsString,
  Min,
  Max,
} from "class-validator";

// create-boarding-booking.dto.ts
export class CreateBoardingBookingDto {
  @IsNumber()
  @IsNotEmpty()
  petId!: number;

  @IsNumber()
  @IsNotEmpty()
  userId!: number;

  @IsNumber()
  @IsNotEmpty()
  boardingId!: number;

  @IsDate()
  @IsNotEmpty()
  startDate!: Date;

  @IsDate()
  @IsNotEmpty()
  endDate!: Date;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}

// boarding-search.dto.ts
export class BoardingSearchDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPricePerDay?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;
}
