// src/shelter-animal/shelter-animal.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateShelterAnimalDto } from './dto/create-shelter-animal.dto';
import { UpdateShelterAnimalDto } from './dto/update-shelter-animal.dto';

@Injectable()
export class ShelterAnimalService {
    constructor(private prisma: PrismaService) {}

    async createAnimal(shelterId: number, userId: number, dto: CreateShelterAnimalDto) {
        // Проверка: пользователь — владелец приюта?
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId, ownerId: userId },
        });

        if (!shelter) {
            throw new ForbiddenException('You do not own this shelter');
        }

        // Проверка: существует ли тип/порода?
        const animalType = await this.prisma.animalType.findUnique({
            where: { id: dto.animalTypeId },
        });
        if (!animalType) throw new BadRequestException('Invalid animal type');

        if (dto.breedId) {
            const breed = await this.prisma.animalBreed.findUnique({
                where: { id: dto.breedId, animalTypeId: dto.animalTypeId },
            });
            if (!breed) throw new BadRequestException('Breed does not match animal type');
        }

        return this.prisma.shelterAnimal.create({
        data: {
            ...dto,
            shelter: { connect: { id: shelterId } },
            isAdopted: dto.isAdopted ?? false,
        },
            include: {
                shelter: { select: { id: true, name: true, address: true } },
                animalType: { select: { id: true, name: true } },
                breed: { select: { id: true, name: true } },
            },

    });
    }

    async findAll(query: {
        shelterId?: number;
        animalTypeId?: number;
        isAdopted?: boolean;
        page?: number;
        limit?: number;
    }) {
        const { shelterId, animalTypeId, isAdopted = false, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        return this.prisma.shelterAnimal.findMany({
            where: {
                ...(shelterId && { shelterId }),
                ...(animalTypeId && { animalTypeId }),
                isAdopted,
            },
            include: {
                shelter: { select: { id: true, name: true } },
                animalType: true,
                breed: true,
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }

    async findOne(id: number) {
        const animal = await this.prisma.shelterAnimal.findUnique({
            where: { id },
            include: {
                shelter: { select: { id: true, name: true, phone: true, email: true } },
                animalType: true,
                breed: true,
            },
        });

        if (!animal) throw new NotFoundException('Animal not found');
        return animal;
    }

    async updateAnimal(shelterId: number, userId: number, animalId: number, dto: UpdateShelterAnimalDto) {
        const animal = await this.findOne(animalId);

        if (animal.shelterId !== shelterId) {
            throw new ForbiddenException('Animal does not belong to this shelter');
        }

        // Повторная проверка прав на приют
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId, ownerId: userId },
        });
        if (!shelter) throw new ForbiddenException('Not your shelter');

        return this.prisma.shelterAnimal.update({
            where: { id: animalId },
            dto,
        });
    }

    async markAsAdopted(shelterId: number, userId: number, animalId: number, adoptionDate?: Date) {
        await this.updateAnimal(shelterId, userId, animalId, {
            isAdopted: true,
            adoptionDate: adoptionDate || new Date(),
        });
    }
}