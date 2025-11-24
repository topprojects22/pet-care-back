// src/event-participation/dto/create-event-participation.dto.ts
import { IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ParticipationStatus } from '@prisma/client';

export class CreateEventParticipationDto {
    @IsNumber()
    postId!: number; // ID поста с типом EVENT

    @IsNumber()
    @IsOptional()
    petId?: number; // какой питомец участвует

    @IsEnum(ParticipationStatus)
    @IsOptional()
    status?: ParticipationStatus; // по умолчанию CONFIRMED
}