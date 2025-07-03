import { Module } from '@nestjs/common';
import { GroomingService } from './grooming.service';
import { GroomingController } from './grooming.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GroomingController],
  providers: [GroomingService, PrismaService],
})
export class GroomingModule {}
