// src/pet-photo/dto/update-pet-photo.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePetPhotoDto } from './create-pet-photo.dto';

export class UpdatePetPhotoDto extends PartialType(CreatePetPhotoDto) {}