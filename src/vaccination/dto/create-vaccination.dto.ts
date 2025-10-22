// src/vaccination/dto/create-vaccination.dto.ts
import { IsString, IsDate, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVaccinationDto {
    @IsString()
    name: string; // Название вакцины (например, "Nobivac DHPPi")

    @Type(() => Date)
    @IsDate()
    date: Date; // Когда сделана прививка

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    nextDate?: Date; // Когда следующая (для ревакцинации)

    @IsNumber()
    @IsOptional()
    clinicId?: number; // Где сделана

    @IsString()
    @IsOptional()
    description?: string; // Доп. информация

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    files?: string[]; // URLs сертификатов/фото
}