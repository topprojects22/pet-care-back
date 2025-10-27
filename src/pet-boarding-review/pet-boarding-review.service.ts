// src/pet-boarding-review/pet-boarding-review.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePetBoardingReviewDto } from './dto/create-pet-boarding-review.dto';

@Injectable()
export class PetBoardingReviewService {
    constructor(private prisma: PrismaService) {}

    async createReview(userId: number, bookingId: number, dto: CreatePetBoardingReviewDto) {
        // Проверка: бронирование существует и завершено
        const booking = await this.prisma.petBoardingBooking.findUnique({
            where: { id: bookingId },
            include: { pet: true, boarding: true },
        });
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.userId !== userId) throw new ForbiddenException('Not your booking');
        if (booking.status !== 'COMPLETED') {
            throw new BadRequestException('Can only review completed bookings');
        }

        // Проверка: отзыв ещё не оставлен
        const existing = await this.prisma.petBoardingReview.findFirst({
            where: { bookingId },
        });
        if (existing) throw new BadRequestException('Review already exists');

        // Создаём отзыв
        const review = await this.prisma.petBoardingReview.create({
        data: {
        ...dto,
            bookingId,
            userId,
            petBoardingId: booking.boardingId,
        },
        include: {
            user: { select: { id: true, name: true, avatarPath: true } },
            booking: {
                include: { pet: { select: { name: true } }, boarding: { select: { name: true } } },
            },
        },
    });

        // Пересчитываем рейтинг передержки
        await this.recalculateBoardingRating(booking.boardingId);

        return review;
    }

    private async recalculateBoardingRating(boardingId: number) {
        const reviews = await this.prisma.petBoardingReview.findMany({
            where: { petBoardingId: boardingId },
            select: { rating: true },
        });

        if (reviews.length === 0) return;

        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await this.prisma.petBoarding.update({
            where: { id: boardingId }, data:
        { rating: parseFloat(avg.toFixed(2)) },
    });
    }

    async findAllForBoarding(boardingId: number, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        return this.prisma.petBoardingReview.findMany({
            where: { petBoardingId: boardingId },
            include: {
                user: { select: { id: true, name: true, avatarPath: true } },
                booking: { include: { pet: { select: { name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }

    async findOne(id: number) {
        const review = await this.prisma.petBoardingReview.findUnique({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }
}