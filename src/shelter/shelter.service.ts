// src/shelter/shelter.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';

@Injectable()
export class ShelterService {
    constructor(private prisma: PrismaService) {}

    async createShelter(userId: number, dto: CreateShelterDto) {
        // Проверка: может ли пользователь создавать приют?
        // (опционально: проверка роли или флага)

        const shelter = await this.prisma.shelter.create({
            data: {
                ...dto,
                owner: {
                    connect: { id: userId },
                },
                isActive: true,
                registrationDate: new Date(),
            },
        });

        return shelter;
    }

    async findAll() {
        return this.prisma.shelter.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                description: true,
                address: true,
                phone: true,
                email: true,
                website: true,
                geoCoordinates: true,
                photos: true,
                registrationDate: true,
                _count: {
                    select: { animals: true, posts: true },
                },
            },
        });
    }

    async findOne(id: number) {
        const shelter = await this.prisma.shelter.findUnique({
            where: { id, isActive: true },
            include: {
                animals: {
                    where: { isAdopted: false },
                    select: { id: true, name: true, photos: true, description: true },
                },
                posts: {
                    where: { isPinned: true },
                    take: 3,
                },
            },
        });

        if (!shelter) throw new NotFoundException('Shelter not found');
        return shelter;
    }

    async updateShelter(userId: number, shelterId: number, dto: UpdateShelterDto) {
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId },
        });

        if (!shelter) throw new NotFoundException('Shelter not found');
        if (shelter.ownerId !== userId) throw new ForbiddenException('Not your shelter');

        return this.prisma.shelter.update({
            where: { id: shelterId },
            data: dto,
        });
    }

    async removeShelter(userId: number, shelterId: number) {
        const shelter = await this.prisma.shelter.findUnique({
            where: { id: shelterId },
        });

        if (!shelter) throw new NotFoundException('Shelter not found');
        if (shelter.ownerId !== userId) throw new ForbiddenException('Not your shelter');

        // Мягкое удаление
        return this.prisma.shelter.update({
            where: { id: shelterId },
            data: { isActive: false },
        });
    }
}