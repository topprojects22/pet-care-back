// src/admission-vet-clinic/admission-vet-clinic.module.ts
import { Module } from '@nestjs/common';
import { AdmissionVetClinicController } from './admission-vet-clinic.controller';
import { AdmissionVetClinicService } from './admission-vet-clinic.service';
import { PrismaService } from '../prisma.service';
import { PetCardUpdaterService } from '../pet-card-updater.service';
import { NotificationSchedulerService } from '../notification/notification.scheduler.service';

@Module({
    controllers: [AdmissionVetClinicController],
    providers: [
        AdmissionVetClinicService,
        PrismaService,
        PetCardUpdaterService,
        NotificationSchedulerService,
    ],
    exports: [AdmissionVetClinicService],
})
export class AdmissionVetClinicModule {}