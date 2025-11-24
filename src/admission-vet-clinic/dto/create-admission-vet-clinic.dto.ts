// src/admission-vet-clinic/dto/create-admission-vet-clinic.dto.ts
import { IsString, IsNumber, IsOptional, IsDate, IsDecimal, IsInt, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdmissionVetClinicDto {
    @IsNumber()
    clinicId!: number;

    @IsString()
    procedure!: string; // "осмотр", "стерилизация", "УЗИ"

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    diagnosis!: string;

    @IsString()
    recomendation!: string;

    @Type(() => Date)
    @IsDate()
    visitDate!: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    nextVisitDate?: Date;

    @IsString()
    @IsOptional()
    doctorName?: string;

    @IsString()
    @IsOptional()
    medications?: string; // можно как JSON или строку

    @IsDecimal()
    cost!: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    files?: string[]; // URLs

    // Физиологические показатели
    @IsDecimal()
    @IsOptional()
    temperature?: number;

    @IsInt()
    @IsOptional()
    pulse?: number;

    @IsInt()
    @IsOptional()
    respiration?: number;

    @IsDecimal()
    @IsOptional()
    weight?: number;

    @IsString()
    @IsOptional()
    anesthesia?: string;

    @IsString()
    @IsOptional()
    complications?: string;

    @IsString()
    @IsOptional()
    status?: string; // "completed", "scheduled"
}