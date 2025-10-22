// src/pet-journal/dto/create-pet-journal-entry.dto.ts
import { IsString, IsOptional, IsArray } from 'class-validator';

export class CreatePetJournalEntryDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    mediaUrls?: string[]; // URLs загруженных фото/видео

    @IsString()
    @IsOptional()
    mood?: string; // "игривый", "усталый", "болен"

    @IsString()
    @IsOptional()
    location?: string; // "Парк Горького", "Дома"
}