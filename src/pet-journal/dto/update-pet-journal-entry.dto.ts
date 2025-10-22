// src/pet-journal/dto/update-pet-journal-entry.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePetJournalEntryDto } from './create-pet-journal-entry.dto';

export class UpdatePetJournalEntryDto extends PartialType(CreatePetJournalEntryDto) {}