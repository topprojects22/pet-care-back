// src/admission-vet-clinic/admission-vet-clinic.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAdmissionVetClinicDto } from './dto/create-admission-vet-clinic.dto';
import { PetCardUpdaterService } from '../pet-card/pet-card-updater.service';
import { NotificationSchedulerService } from '../notification/notification.scheduler.service';
import { UpdateAdmissionVetClinicDto } from './dto/update-admission-vet-clinic.dto';

@Injectable()
export class AdmissionVetClinicService {
    constructor(
        private prisma: PrismaService,
        private petCardUpdater: PetCardUpdaterService,
        private notificationScheduler: NotificationSchedulerService,
    ) {}

    async createAdmission(userId: number, petId: number, dto: CreateAdmissionVetClinicDto) {
        // Проверка: питомец принадлежит пользователю
        const pet = await this.prisma.pet.findUnique({ where: { id: petId, userId } });
        if (!pet) throw new ForbiddenException('Pet not found or not yours');

        // Проверка: клиника существует
        const clinic = await this.prisma.clinic.findUnique({ where: { id: dto.clinicId } });
        if (!clinic) throw new BadRequestException('Clinic not found');

        const admission = await this.prisma.admissionVetClinic.create({
        data: {
        ...dto,
            petId,
            clinicId: dto.clinicId,
        },
        include: {
            pet: { select: { id: true, name: true } },
            clinic: { select: { id: true, name: true } },
        },
    });

        // Обновляем PetCard
        await this.petCardUpdater.updateAfterVetVisit(
            petId,
            dto.visitDate,
            dto.nextVisitDate,
        );

        // Создаём напоминание, если есть nextVisitDate
        if (dto.nextVisitDate) {
            await this.notificationScheduler.createVetVisitReminder(
                admission.id,
                petId,
                dto.nextVisitDate,
            );
        }

        return admission;
    }

    async findAllForPet(petId: number) {
        return this.prisma.admissionVetClinic.findMany({
            where: { petId },
            orderBy: { visitDate: 'desc' },
            include: {
                clinic: { select: { id: true, name: true, address: true } },
                pet: { select: { id: true, name: true } },
            },
        });
    }

    async findOne(id: number) {
        const admission = await this.prisma.admissionVetClinic.findUnique({ where: { id } });
        if (!admission) throw new NotFoundException('Admission record not found');
        return admission;
    }

    async updateAdmission(userId: number, id: number, dto: UpdateAdmissionVetClinicDto) {
        const admission = await this.findOne(id);
        const pet = await this.prisma.pet.findUnique({
            where: { id: admission.petId },
            select: { userId: true },
        });
        if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.admissionVetClinic.update({
            where: { id },
            data: dto,
        });
    }

    async removeAdmission(userId: number, id: number) {
        const admission = await this.findOne(id);
        const pet = await this.prisma.pet.findUnique({
            where: { id: admission.petId },
            select: { userId: true },
        });
        if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.admissionVetClinic.delete({ where: { id } });
    }
}