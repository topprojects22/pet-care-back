// src/pet-card/pet-card.module.ts
import { Module } from '@nestjs/common';
import { PetCardController } from './pet-card.controller';
import { PetCardService } from './pet-card.service';
import { PetCardUpdaterService } from './pet-card-updater.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    controllers: [PetCardController],
    providers: [PetCardService, PetCardUpdaterService, PrismaService],
    exports: [PetCardService, PetCardUpdaterService],
})
export class PetCardModule {}