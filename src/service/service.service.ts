// src/service/service.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import {UpdateServiceDto} from "./dto/update-service.dto";

@Injectable()
export class ServiceService {
    constructor(private prisma: PrismaService) {}

    async createService(clinicId: number, userId: number, dto: CreateServiceDto) {
        // Проверка: пользователь — владелец или сотрудник клиники?
        const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
        if (!clinic) throw new BadRequestException('Clinic not found');

        // 🔐 Простая проверка: пока только владелец через `preferredBy` или отдельную роль
        // В реальности — нужна модель StaffMember с правами
        const isOwner = await this.prisma.clinic.findFirst({
            where: { id: clinicId, preferredBy: { some: { id: userId } } },
        });
        if (!isOwner) {
            throw new ForbiddenException('Only clinic staff can manage services');
        }

        return this.prisma.service.create({
            data: { ...dto, clinicId },
            include: { clinic: { select: { id: true, name: true } } },
        });
    }

    async findAllForClinic(clinicId: number, category?: string) {
        return this.prisma.service.findMany({
            where: { clinicId, ...(category && { category }) },
            orderBy: { price: 'asc' },
            include: { clinic: { select: { id: true, name: true } } },
        });
    }

    async findOne(id: number) {
        const service = await this.prisma.service.findUnique({ where: { id } });
        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    async updateService(clinicId: number, userId: number, id: number, dto: UpdateServiceDto) {
        const service = await this.findOne(id);
        if (service.clinicId !== clinicId) {
            throw new ForbiddenException('Service does not belong to this clinic');
        }

        // Повторная проверка прав
        const isOwner = await this.prisma.clinic.findFirst({
            where: { id: clinicId, preferredBy: { some: { id: userId } } },
        });
        if (!isOwner) throw new ForbiddenException('Not authorized');

        return this.prisma.service.update({
            where: { id },
            data: dto,
        });
    }

    async removeService(clinicId: number, userId: number, id: number) {
        const service = await this.findOne(id);
        if (service.clinicId !== clinicId) throw new ForbiddenException('Not your service');

        const isOwner = await this.prisma.clinic.findFirst({
            where: { id: clinicId, preferredBy: { some: { id: userId } } },
        });
        if (!isOwner) throw new ForbiddenException('Not authorized');

        return this.prisma.service.delete({ where: { id } });
    }
}