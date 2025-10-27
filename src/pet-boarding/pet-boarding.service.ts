// src/pet-boarding/pet-boarding.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePetBoardingDto } from './dto/create-pet-boarding.dto';

@Injectable()
export class PetBoardingService {
    constructor(private prisma: PrismaService) {}

    async createListing(userId: number, dto: CreatePetBoardingDto) {
        return this.prisma.petBoarding.create({
        data: {
            ...dto,
            email: dto.email.toLowerCase(),
            user: { connect: { id: userId } }
        }, // Используем связь через connect, isActive: true },
        include: { user: { select: { id: true, name: true } } },
    });
    }

    async findAllActive(query: { page?: number; limit?: number; userId?: number }) {
        const { page = 1, limit = 20, userId } = query;
        const skip = (page - 1) * limit;

        return this.prisma.petBoarding.findMany({
            where: { isActive: true, ...(userId && { userId }) },
            include: {
                user: { select: { id: true, name: true, avatarPath: true } },
                _count: { select: { bookings: true, reviews: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }

    async findOne(id: number) {
        const listing = await this.prisma.petBoarding.findUnique({
            where: { id, isActive: true },
            include: {
                user: { select: { id: true, name: true, phone: true, email: true } },
                reviews: {
                    include: { user: { select: { name: true, avatarPath: true } } },
                },
            },
        });
        if (!listing) throw new NotFoundException('Boarding listing not found');
        return listing;
    }

    async updateListing(userId: number, id: number, dto: any) {
        const listing = await this.findOne(id);
        if (listing.userId !== userId) throw new ForbiddenException('Not your listing');
        return this.prisma.petBoarding.update({ where: { id },  data:dto });
    }

    async removeListing(userId: number, id: number) {
        const listing = await this.findOne(id);
        if (listing.userId !== userId) throw new ForbiddenException('Not your listing');
        return this.prisma.petBoarding.update({ where: { id },  data: { isActive: false } });
    }
}