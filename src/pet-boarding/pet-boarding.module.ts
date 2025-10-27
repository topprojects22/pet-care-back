// src/pet-boarding/pet-boarding.module.ts
import { Module } from '@nestjs/common';
import { PetBoardingController } from './pet-boarding.controller';
import { PetBoardingService } from './pet-boarding.service';
import { BookingService } from './booking.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [PetBoardingController],
    providers: [PetBoardingService, BookingService, PrismaService],
    exports: [PetBoardingService, BookingService],
})
export class PetBoardingModule {}