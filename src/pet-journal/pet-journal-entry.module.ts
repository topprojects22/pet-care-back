// src/pet-journal/pet-journal-entry.module.ts
import { Module } from '@nestjs/common';
import { PetJournalEntryController } from './pet-journal-entry.controller';
import { PetJournalEntryService } from './pet-journal-entry.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [PetJournalEntryController],
    providers: [PetJournalEntryService, PrismaService],
    exports: [PetJournalEntryService],
})
export class PetJournalEntryModule {}