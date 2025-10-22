// src/vaccination/vaccination.module.ts
import { Module } from '@nestjs/common';
import { VaccinationController } from './vaccination.controller';
import { VaccinationService } from './vaccination.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [VaccinationController],
  providers: [VaccinationService, PrismaService],
  exports: [VaccinationService],
})
export class VaccinationModule {}