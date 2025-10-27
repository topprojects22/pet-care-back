// src/pet-passport/pet-passport.module.ts
import { Module } from '@nestjs/common';
import { PetPassportController } from './pet-passport.controller';
import { PetPassportService } from './pet-passport.service';
import { PassportPdfGeneratorService } from './passport-pdf-generator.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [PetPassportController],
    providers: [PetPassportService, PassportPdfGeneratorService, PrismaService],
    exports: [PetPassportService],
})
export class PetPassportModule {}