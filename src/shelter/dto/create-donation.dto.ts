import { IsNumber, IsString, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateDonationDto {
  @IsNumber()
  @Min(100, { message: 'Minimum donation amount is 100 RUB' })
  amount!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsBoolean()
  @IsOptional()
  anonymous?: boolean;

  @IsBoolean()
  @IsOptional()
  recurring?: boolean;
}

