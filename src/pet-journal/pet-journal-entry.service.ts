// src/pet-journal/pet-journal-entry.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePetJournalEntryDto } from './dto/create-pet-journal-entry.dto';
import { UpdatePetJournalEntryDto } from './dto/update-pet-journal-entry.dto';

@Injectable()
export class PetJournalEntryService {
    constructor(private prisma: PrismaService) {}

    async createEntry(userId: number, petId: number, dto: CreatePetJournalEntryDto) {
        // Проверка: питомец принадлежит пользователю?
        const pet = await this.prisma.pet.findUnique({
            where: { id: petId, userId },
        });

        if (!pet) {
            throw new ForbiddenException('Pet does not belong to you');
        }

        return this.prisma.petJournalEntry.create({
            data: {
                ...dto,
                pet: { connect: { id: petId } },
            },
            include: {
                pet: { select: { id: true, name: true } },
            },
        });
    }

    async findAllForPet(petId: number, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        return this.prisma.petJournalEntry.findMany({
            where: { petId },
            include: {
                pet: { select: { id: true, name: true, animalType: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }

    async findOne(id: number) {
        const entry = await this.prisma.petJournalEntry.findUnique({
            where: { id },
            include: {
                pet: { select: { id: true, name: true, user: { select: { id: true } } } },
            },
        });

        if (!entry) throw new NotFoundException('Journal entry not found');
        return entry;
    }

    async updateEntry(userId: number, entryId: number, dto: UpdatePetJournalEntryDto) {
        const entry = await this.findOne(entryId);

        // Проверка: владелец питомца — это пользователь?
        const pet = await this.prisma.pet.findUnique({
            where: { id: entry.petId },
            select: { userId: true },
        });

        if (pet.userId !== userId) {
            throw new ForbiddenException('Not your pet');
        }

        return this.prisma.petJournalEntry.update({
            where: { id: entryId },
            data: dto,
        });
    }

    async removeEntry(userId: number, entryId: number) {
        const entry = await this.findOne(entryId);

        const pet = await this.prisma.pet.findUnique({
            where: { id: entry.petId },
            select: { userId: true },
        });

        if (pet.userId !== userId) {
            throw new ForbiddenException('Not your pet');
        }

        return this.prisma.petJournalEntry.delete({ where: { id: entryId } });
    }
}