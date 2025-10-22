// src/pet-passport/dto/update-pet-passport.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePetPassportDto } from './create-pet-passport.dto';

export class UpdatePetPassportDto extends PartialType(CreatePetPassportDto) {}