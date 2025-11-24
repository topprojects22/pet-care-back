// src/pet-boarding/pet-boarding.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePetBoardingDto } from './dto/create-pet-boarding.dto';
import { createPaginatedResponse } from '../common/utils/response.util';

@Injectable()
export class PetBoardingService {
    constructor(private prisma: PrismaService) {}

    async createListing(userId: number, dto: CreatePetBoardingDto) {
        return this.prisma.petBoarding.create({
        data: {
            ...dto,
            email: dto.email?.toLowerCase() || '',
            user: { connect: { id: userId } }
        }, // Используем связь через connect, isActive: true },
        include: { user: { select: { id: true, name: true } } },
    });
    }

    async findAllActive(query: { 
        page?: number; 
        limit?: number; 
        userId?: number;
        city?: string;
        maxPrice?: number;
        minPrice?: number;
        acceptsCats?: boolean;
        acceptsDogs?: boolean;
    }) {
        const { 
            page = 1, 
            limit = 20, 
            userId,
            city,
            maxPrice,
            minPrice,
            acceptsCats,
            acceptsDogs,
        } = query;
        const skip = (page - 1) * limit;

        const where: any = { isActive: true };
        
        if (userId) {
            where.userId = userId;
        }

        if (city) {
            where.city = { contains: city, mode: 'insensitive' };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.pricePerDay = {};
            if (minPrice !== undefined) {
                where.pricePerDay.gte = minPrice;
            }
            if (maxPrice !== undefined) {
                where.pricePerDay.lte = maxPrice;
            }
        }

        // Note: acceptsCats and acceptsDogs are not in the schema yet
        // If needed, add them to the PetBoarding model in schema.prisma
        // For now, we'll skip these filters

        // Оптимизированный запрос с select и пагинацией
        const [listings, total] = await Promise.all([
            this.prisma.petBoarding.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    address: true,
                    pricePerDay: true,
                    capacity: true,
                    availableSpots: true,
                    photos: true,
                    createdAt: true,
                    user: { 
                        select: { 
                            id: true, 
                            name: true, 
                            lastName: true,
                            avatarPath: true,
                            phone: true,
                        } 
                    },
                    _count: { 
                        select: { 
                            bookings: true, 
                            reviews: true 
                        } 
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.petBoarding.count({ where }),
        ]);

        return createPaginatedResponse(listings, page, limit, total);
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

    async updateListing(userId: number, id: number, dto: Partial<CreatePetBoardingDto>) {
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