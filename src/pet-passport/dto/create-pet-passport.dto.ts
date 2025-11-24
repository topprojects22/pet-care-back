// src/pet-passport/dto/create-pet-passport.dto.ts
import { IsInt, IsString, IsOptional, IsDate } from 'class-validator';

export class CreatePetPassportDto {
    @IsInt()
    chip!: number; // уникальный номер чипа

    @IsDate()
    @IsOptional()
    chipInstallDate?: Date;

    @IsInt()
    @IsOptional()
    breedId?: number;

    @IsString()
    @IsOptional()
    tattooNumber?: string;

    @IsString()
    @IsOptional()
    specialMarks?: string;

    @IsString()
    @IsOptional()
    issuingOrganization?: string;

    @IsString()
    @IsOptional()
    registrationNumber?: string;

    @IsString()
    @IsOptional()
    ownerSignature?: string;

    @IsString()
    @IsOptional()
    vetSignature?: string;
}