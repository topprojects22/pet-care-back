// src/medication/medication.module.ts
import { Module } from '@nestjs/common';
import { MedicationController } from './medication.controller';
import { MedicationService } from './medication.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [MedicationController],
  providers: [MedicationService, PrismaService],
  exports: [MedicationService],
})
export class MedicationModule {}