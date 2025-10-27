// src/pet-boarding-review/pet-boarding-review.module.ts
import { Module } from '@nestjs/common';
import { PetBoardingReviewController } from './pet-boarding-review.controller';
import { PetBoardingReviewService } from './pet-boarding-review.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [PetBoardingReviewController],
    providers: [PetBoardingReviewService, PrismaService],
    exports: [PetBoardingReviewService],
})
export class PetBoardingReviewModule {}