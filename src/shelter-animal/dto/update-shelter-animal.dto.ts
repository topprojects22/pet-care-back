// src/shelter-animal/dto/update-shelter-animal.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateShelterAnimalDto } from './create-shelter-animal.dto';
import { IsDate } from 'class-validator';

export class UpdateShelterAnimalDto extends PartialType(CreateShelterAnimalDto) {
    @IsDate()
    adoptionDate?: Date;
}