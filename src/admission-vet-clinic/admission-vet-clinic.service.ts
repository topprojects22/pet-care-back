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
import { createPaginatedResponse } from '../common/utils/response.util';

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
            procedure: dto.procedure,
            description: dto.description || '',
            diagnosis: dto.diagnosis,
            recomendation: dto.recomendation,
            visitDate: dto.visitDate,
            nextVisitDate: dto.nextVisitDate,
            doctorName: dto.doctorName,
            medications: dto.medications,
            cost: dto.cost,
            files: dto.files,
            temperature: dto.temperature,
            pulse: dto.pulse,
            respiration: dto.respiration,
            weight: dto.weight,
            anesthesia: dto.anesthesia,
            complications: dto.complications,
            status: dto.status,
            pet: { connect: { id: petId } },
            clinic: { connect: { id: dto.clinicId } }
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

    async findAllForPet(
        petId: number,
        query: {
            page?: number;
            limit?: number;
            clinicId?: number;
            startDate?: string;
            endDate?: string;
            fromDate?: string;
            toDate?: string;
            sortBy?: string;
            sortOrder?: string;
        },
    ) {
        const { page = 1, limit = 20, clinicId, startDate, endDate, fromDate, toDate, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        // Используем fromDate/toDate или startDate/endDate
        const start = startDate || fromDate;
        const end = endDate || toDate;

        // Формируем условие WHERE
        const where: any = { petId };
        
        if (clinicId) {
            where.clinicId = clinicId;
        }

        if (start || end) {
            where.visitDate = {};
            if (start) {
                where.visitDate.gte = new Date(start);
            }
            if (end) {
                where.visitDate.lte = new Date(end);
            }
        }

        // Определяем сортировку
        const orderBy: any = {};
        if (sortBy) {
            orderBy[sortBy] = sortOrder || 'desc';
        } else {
            orderBy.visitDate = 'desc';
        }

        // Оптимизированный запрос с select
        const [visits, total] = await Promise.all([
            this.prisma.admissionVetClinic.findMany({
                where,
                select: {
                    id: true,
                    procedure: true,
                    diagnosis: true,
                    recomendation: true,
                    visitDate: true,
                    nextVisitDate: true,
                    doctorName: true,
                    cost: true,
                    status: true,
                    createdAt: true,
                    clinic: { select: { id: true, name: true, address: true } },
                    pet: { select: { id: true, name: true } },
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.admissionVetClinic.count({ where }),
        ]);

        return createPaginatedResponse(visits, page, limit, total);
    }

    async findOne(id: number) {
        const admission = await this.prisma.admissionVetClinic.findUnique({
            where: { id },
            select: {
                id: true,
                procedure: true,
                diagnosis: true,
                recomendation: true,
                visitDate: true,
                nextVisitDate: true,
                doctorName: true,
                cost: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                clinic: { select: { id: true, name: true, address: true } },
                pet: { select: { id: true, name: true } },
            },
        });
        if (!admission) throw new NotFoundException('Admission record not found');
        return admission;
    }

    async updateAdmission(userId: number, id: number, dto: UpdateAdmissionVetClinicDto) {
        const admission = await this.findOne(id);
        if (!admission.pet) throw new NotFoundException('Pet not found');
        const pet = await this.prisma.pet.findUnique({
            where: { id: admission.pet.id },
            select: { userId: true },
        });
        if (!pet || pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.admissionVetClinic.update({
            where: { id },
            data: dto,
        });
    }

    async removeAdmission(userId: number, id: number) {
        const admission = await this.findOne(id);
        if (!admission.pet) throw new NotFoundException('Pet not found');
        const pet = await this.prisma.pet.findUnique({
            where: { id: admission.pet.id },
            select: { userId: true },
        });
        if (!pet || pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.admissionVetClinic.delete({ where: { id } });
    }
}