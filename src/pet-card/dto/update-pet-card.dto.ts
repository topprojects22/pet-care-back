// src/pet-card/dto/update-pet-card.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePetCardDto } from './create-pet-card.dto';

export class UpdatePetCardDto extends PartialType(CreatePetCardDto) {}