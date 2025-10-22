// src/pet-passport/pet-passport.module.ts
import { Module } from '@nestjs/common';
import { PetPassportController } from './pet-passport.controller';
import { PetPassportService } from './services/pet-passport.service';
import { PassportPdfGeneratorService } from './services/passport-pdf-generator.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [PetPassportController],
    providers: [PetPassportService, PassportPdfGeneratorService, PrismaService],
    exports: [PetPassportService],
})
export class PetPassportModule {}