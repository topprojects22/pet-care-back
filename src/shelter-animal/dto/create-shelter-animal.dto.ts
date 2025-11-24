// src/shelter-animal/dto/create-shelter-animal.dto.ts
import { IsString, IsNumber, IsOptional, IsEnum, IsArray } from 'class-validator';
import { PetGender } from '@prisma/client';

export class CreateShelterAnimalDto {
    @IsString()
    name!: string;

    @IsNumber()
    animalTypeId!: number;

    @IsNumber()
    @IsOptional()
    breedId?: number;

    @IsEnum(PetGender)
    gender!: PetGender;

    @IsNumber()
    @IsOptional()
    ageEstimate?: number; // возраст в месяцах

    @IsString()
    description!: string;

    @IsArray()
    @IsString({ each: true })
    photos!: string[]; // обязательные фото

    @IsString()
    @IsOptional()
    specialNeeds?: string; // "нужен дом без детей", "требует лечения"

    @IsOptional()
    isAdopted?: boolean; // по умолчанию false
}