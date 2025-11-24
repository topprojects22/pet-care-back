// src/grooming-record/dto/create-grooming-record.dto.ts
import { IsString, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroomingRecordDto {
    @IsString()
    serviceType!: string; // "haircut", "bath", "ear_cleaning", "nail_trim"

    @IsString()
    @IsOptional()
    status?: string; // "completed", "scheduled", "cancelled"

    @Type(() => Date)
    @IsDate()
    date!: Date; // когда была/будет процедура

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    nextDate?: Date; // когда следующая

    @IsString()
    @IsOptional()
    groomerName?: string; // имя или название салона

    @IsString()
    @IsOptional()
    notes?: string; // "боится фена", "аллергия на шампунь X"

    @IsNumber()
    @IsOptional()
    cost?: number; // стоимость услуги
}