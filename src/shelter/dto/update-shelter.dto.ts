// src/shelter/dto/update-shelter.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateShelterDto } from './create-shelter.dto';
import { IsDate } from 'class-validator';

export class UpdateShelterDto extends PartialType(CreateShelterDto) {
    @IsDate()
    adoptionDate?: Date; // Добавьте это поле
}