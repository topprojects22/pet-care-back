// src/grooming-record/grooming-record.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGroomingRecordDto } from './dto/create-grooming-record.dto';
import {UpdateGroomingRecordDto} from "./dto/update-grooming-record.dto";

@Injectable()
export class GroomingRecordService {
    constructor(private prisma: PrismaService) {}

    async createRecord(userId: number, petId: number, dto: CreateGroomingRecordDto) {
        const pet = await this.prisma.pet.findUnique({ where: { id: petId, userId } });
        if (!pet) throw new ForbiddenException('Pet not found or not yours');

        return this.prisma.groomingRecord.create({
        data: {
        ...dto,
            petId,
        },
        include: { pet: { select: { id: true, name: true } } },
    });
    }

    async findAllForPet(petId: number, includeFuture = false) {
        const where: any = { petId };
        if (!includeFuture) {
            where.date = { lte: new Date() };
        }

        return this.prisma.groomingRecord.findMany({
            where,
            orderBy: { date: 'desc' },
            include: { pet: { select: { id: true, name: true } } },
        });
    }

    async findOne(id: number) {
        const record = await this.prisma.groomingRecord.findUnique({ where: { id } });
        if (!record) throw new NotFoundException('Grooming record not found');
        return record;
    }

    async updateRecord(userId: number, id: number, dto: UpdateGroomingRecordDto) {
        const record = await this.findOne(id);
        const pet = await this.prisma.pet.findUnique({
            where: { id: record.petId },
            select: { userId: true },
        });
        if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.groomingRecord.update({
            where: { id },
            dto,
        });
    }

    async removeRecord(userId: number, id: number) {
        const record = await this.findOne(id);
        const pet = await this.prisma.pet.findUnique({
            where: { id: record.petId },
            select: { userId: true },
        });
        if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.groomingRecord.delete({ where: { id } });
    }
}