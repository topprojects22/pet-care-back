// src/medication/dto/create-medication.dto.ts
import { IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicationDto {
    @IsString()
    name!: string; // Название препарата

    @IsString()
    dosage!: string; // "5 мг", "1 таблетка"

    @IsString()
    frequency!: string; // "2 раза в день", "каждые 12 часов"

    @Type(() => Date)
    @IsDate()
    startDate!: Date; // Когда начать приём

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    endDate?: Date; // Когда закончить (если курсовой)

    @IsString()
    @IsOptional()
    description?: string; // "Давать после еды", "возможна сонливость"
}