// src/pet-card/dto/create-pet-card.dto.ts
import { IsString, IsOptional, IsInt, IsDate } from 'class-validator';

export class CreatePetCardDto {
    @IsString()
    status: string; // "здоров", "на лечении", "восстановление"

    @IsString()
    health: string; // общее состояние

    @IsString()
    vaccine: string; // актуальные вакцины

    @IsInt()
    totalSpent: number; // можно инициализировать как 0

    @IsDate()
    @IsOptional()
    lastVetVisit?: Date;

    @IsDate()
    @IsOptional()
    nextVetVisit?: Date;

    @IsString()
    @IsOptional()
    allergies?: string;

    @IsString()
    @IsOptional()
    chronicDiseases?: string;

    @IsString()
    @IsOptional()
    favoriteFood?: string;

    @IsString()
    @IsOptional()
    bloodType?: string;

    @IsString()
    @IsOptional()
    dentalRecords?: string;

    @IsString()
    @IsOptional()
    parasiteControl?: string;

    @IsString()
    @IsOptional()
    spayNeuterInfo?: string;

    @IsString()
    @IsOptional()
    microchipInfo?: string;
}