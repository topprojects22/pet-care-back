// src/pet-photo/dto/create-pet-photo.dto.ts
import { IsBoolean, IsOptional } from "class-validator";

export class CreatePetPhotoDto {
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean; // Сделать ли фото главным (по умолчанию — false)
}
