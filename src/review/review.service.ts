// src/review/review.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService) {}

    async createReview(userId: number, clinicId: number, dto: CreateReviewDto) {
        // Проверка: клиника существует
        const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId } });
        if (!clinic) throw new NotFoundException('Clinic not found');

        // Проверка: пользователь ещё не оставлял отзыв
        const existing = await this.prisma.review.findFirst({
            where: { userId, clinicId },
        });
        if (existing) {
            throw new BadRequestException('You have already reviewed this clinic');
        }

        // Создаём отзыв
        const review = await this.prisma.review.create({
        data: { ...dto, userId, clinicId },
        include: {
            user: { select: { id: true, name: true, avatarPath: true } },
        },
    });

        // Пересчитываем рейтинг клиники
        await this.recalculateClinicRating(clinicId);

        return review;
    }

    private async recalculateClinicRating(clinicId: number) {
        const reviews = await this.prisma.review.findMany({
            where: { clinicId },
            select: { rating: true },
        });

        if (reviews.length === 0) return;

        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        await this.prisma.clinic.update({
            where: { id: clinicId },
        data: { rating: parseFloat(avg.toFixed(2)) },
    });
    }

    async findAllForClinic(clinicId: number, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        return this.prisma.review.findMany({
            where: { clinicId },
            include: {
                user: { select: { id: true, name: true, avatarPath: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }

    async findOne(id: number) {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) throw new NotFoundException('Review not found');
        return review;
    }

    // Опционально: удаление (только для админа или самого пользователя)
    async removeReview(userId: number, id: number) {
        const review = await this.findOne(id);
        if (review.userId !== userId) {
            throw new ForbiddenException('Not your review');
        }

        await this.prisma.review.delete({ where: { id } });
        await this.recalculateClinicRating(review.clinicId);
        return { success: true };
    }
}