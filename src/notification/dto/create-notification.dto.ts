// src/notification/dto/create-notification.dto.ts
import { IsString, IsOptional, IsEnum, IsDate, IsNumber, IsArray } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
    @IsString()
    name!: string;

    @IsString()
    description!: string;

    @IsEnum(NotificationType)
    type!: NotificationType;

    @IsDate()
    @IsOptional()
    expiriedAt?: Date;

    @IsString()
    @IsOptional()
    location?: string;

    @IsString()
    @IsOptional()
    repeatPattern?: string; // "daily", "weekly", "monthly"

    @IsNumber()
    @IsOptional()
    priority?: number; // 1–10

    @IsString()
    @IsOptional()
    attachmentUrl?: string;

    @IsArray()
    @IsNumber({}, { each: true })
    @IsOptional()
    petIds?: number[]; // для привязки к питомцам
}