// src/shelter-animal/shelter-animal.module.ts
import { Module } from '@nestjs/common';
import { ShelterAnimalController } from './shelter-animal.controller';
import { ShelterAnimalService } from './shelter-animal.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [ShelterAnimalController],
    providers: [ShelterAnimalService, PrismaService],
    exports: [ShelterAnimalService],
})
export class ShelterAnimalModule {}