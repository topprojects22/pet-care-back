// src/shelter-animal/dto/update-shelter-animal.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateShelterAnimalDto } from './create-shelter-animal.dto';

export class UpdateShelterAnimalDto extends PartialType(CreateShelterAnimalDto) {}