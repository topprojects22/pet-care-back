// src/service/dto/create-service.dto.ts
import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    name!: string; // "Стерилизация", "УЗИ брюшной полости"

    @IsString()
    description!: string; // подробное описание

    @IsString()
    recomendation!: string; // рекомендации после процедуры

    @IsNumber()
    price!: number; // в рублях/тенге/USD

    @IsNumber()
    duration!: number; // в минутах

    @IsString()
    category!: string; // "хирургия", "лаборатория", "профилактика"

    @IsBoolean()
    @IsOptional()
    isEmergency?: boolean; // срочная услуга

    @IsString()
    @IsOptional()
    preparation?: string; // "не кормить 12 часов"

    @IsString()
    @IsOptional()
    recoveryTime?: string; // "2–3 дня покоя"

    @IsString()
    @IsOptional()
    contraindications?: string; // "беременность, возраст <6 мес"

    @IsNumber()
    @IsOptional()
    successRate?: number; // 98.5
}