// src/pet-photo/dto/create-pet-photo.dto.ts
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePetPhotoDto {
    @IsString()
    url: string; // уже загруженный URL (например, из S3)

    @IsBoolean()
    @IsOptional()
    isPrimary?: boolean; // сделать ли фото главным
}