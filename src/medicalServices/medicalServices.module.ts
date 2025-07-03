import { Module } from '@nestjs/common';
import { MedicalServicesService } from './medicalServices.service';
import { MedicalServicesController } from './medicalServices.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MedicalServicesController],
  providers: [MedicalServicesService, PrismaService],
})
export class MedicalServicesModule {}
