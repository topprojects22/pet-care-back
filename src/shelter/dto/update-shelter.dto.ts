// src/shelter/dto/update-shelter.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateShelterDto } from './create-shelter.dto';

export class UpdateShelterDto extends PartialType(CreateShelterDto) {}