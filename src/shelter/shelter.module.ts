// src/shelter/shelter.module.ts
import { Module } from '@nestjs/common';
import { ShelterController } from './shelter.controller';
import { ShelterService } from './shelter.service';
import { PrismaService } from '../prisma.service'; // ваш глобальный PrismaService

@Module({
    controllers: [ShelterController],
    providers: [ShelterService, PrismaService],
    exports: [ShelterService],
})
export class ShelterModule {}