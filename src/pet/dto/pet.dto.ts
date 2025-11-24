import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  Min,
  IsBoolean,
  IsArray,
  IsObject,
} from "class-validator";
import { PetGender } from "@prisma/client";
// create-pet.dto.ts
export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weight?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isSterilized?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsNumber()
  animalTypeId?: number;
}

// update-pet.dto.ts
export class UpdatePetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsEnum(PetGender)
  gender?: PetGender;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  weight?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isSterilized?: boolean;
}

// create-pet-passport.dto.ts
export class CreatePetPassportDto {
  @IsNumber()
  @IsNotEmpty()
  petId!: number;

  @IsNumber()
  @IsNotEmpty()
  chip!: number;

  @IsOptional()
  @IsDate()
  chipInstallDate?: Date;

  @IsOptional()
  @IsNumber()
  breedId?: number;

  @IsOptional()
  @IsString()
  tattooNumber?: string;

  @IsOptional()
  @IsString()
  specialMarks?: string;

  @IsOptional()
  @IsString()
  issuingOrganization?: string;

  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @IsOptional()
  @IsObject()
  vaccinationHistory?: Record<string, any>;
}

// pet-photo.dto.ts
export class PetPhotoDto {
  @IsNumber()
  @IsNotEmpty()
  petId!: number;

  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
