import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsPhoneNumber } from 'class-validator';

export class AdoptAnimalDto {
  @IsString()
  @IsNotEmpty()
  contactPhone!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsString()
  @IsOptional()
  adoptionReason?: string;

  @IsBoolean()
  previousExperience!: boolean;

  @IsBoolean()
  agreementAccepted!: boolean;
}

