// src/staff-member/staff-member.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import {UpdateStaffMemberDto} from "./dto/update-staff-member.dto";

@Injectable()
export class StaffMemberService {
    constructor(private prisma: PrismaService) {}

    async createStaffMember(clinicId: number, userId: number, dto: CreateStaffMemberDto) {
        // Проверка: пользователь — владелец или админ клиники
        const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
        if (!clinic) throw new BadRequestException('Clinic not found');

        const isOwner = await this.prisma.clinic.findFirst({
            where: { id: clinicId, preferredBy: { some: { id: userId } } },
        });
        if (!isOwner) throw new ForbiddenException('Only clinic owners can manage staff');

        return this.prisma.staffMember.create({
        data: { ...dto, clinicId, isActive: dto.isActive ?? true },
        include: { clinic: { select: { id: true, name: true } } },
    });
    }

    async findAllForClinic(clinicId: number, onlyActive = true) {
        return this.prisma.staffMember.findMany({
            where: { clinicId, ...(onlyActive && { isActive: true }) },
            orderBy: { name: 'asc' },
            include: { clinic: { select: { id: true, name: true } } },
        });
    }

    async findOne(id: number) {
        const staff = await this.prisma.staffMember.findUnique({ where: { id } });
        if (!staff) throw new NotFoundException('Staff member not found');
        return staff;
    }

    async updateStaffMember(clinicId: number, userId: number, id: number, dto: UpdateStaffMemberDto) {
        const staff = await this.findOne(id);
        if (staff.clinicId !== clinicId) throw new ForbiddenException('Not your clinic');

        const isOwner = await this.prisma.clinic.findFirst({
            where: { id: clinicId, preferredBy: { some: { id: userId } } },
        });
        if (!isOwner) throw new ForbiddenException('Not authorized');

        return this.prisma.staffMember.update({
            where: { id },
            data: dto,
        });
    }

    async removeStaffMember(clinicId: number, userId: number, id: number) {
        const staff = await this.findOne(id);
        if (staff.clinicId !== clinicId) throw new ForbiddenException('Not your clinic');

        const isOwner = await this.prisma.clinic.findFirst({
            where: { id: clinicId, preferredBy: { some: { id: userId } } },
        });
        if (!isOwner) throw new ForbiddenException('Not authorized');

        // Мягкое удаление: деактивация
        return this.prisma.staffMember.update({
            where: { id },
        data: { isActive: false },
    });
    }
}