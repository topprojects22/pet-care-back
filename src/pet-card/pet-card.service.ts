// src/pet-card/services/pet-card.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePetCardDto } from '../dto/create-pet-card.dto';
import {UpdatePetCardDto} from "./dto/update-pet-card.dto";

@Injectable()
export class PetCardService {
    constructor(private prisma: PrismaService) {}

    async createCard(userId: number, petId: number, dto: CreatePetCardDto) {
        const pet = await this.prisma.pet.findUnique({ where: { id: petId, userId } });
        if (!pet) throw new ForbiddenException('Pet not found or not yours');

        const existing = await this.prisma.petCard.findUnique({ where: { petId } });
        if (existing) throw new BadRequestException('Pet card already exists');

        return this.prisma.petCard.create({
        data: { ...dto, petId },
        include: { pet: { select: { id: true, name: true } } },
    });
    }

    async findOneByPetId(petId: number) {
        const card = await this.prisma.petCard.findUnique({
            where: { petId },
            include: { pet: { select: { id: true, name: true } } },
        });
        if (!card) throw new NotFoundException('Pet card not found');
        return card;
    }

    async updateCard(userId: number, petId: number, dto: UpdatePetCardDto) {
        const card = await this.findOneByPetId(petId);
        const pet = await this.prisma.pet.findUnique({ where: { id: petId }, select: { userId: true } });
        if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

        return this.prisma.petCard.update({
            where: { petId },
            dto,
        });
    }
}