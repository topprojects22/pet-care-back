// src/event-participation/event-participation.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEventParticipationDto } from './dto/create-event-participation.dto';
import { UpdateEventParticipationDto } from './dto/update-event-participation.dto';
import { ParticipationStatus } from '@prisma/client';

@Injectable()
export class EventParticipationService {
    constructor(private prisma: PrismaService) {}

    async createParticipation(userId: number, dto: CreateEventParticipationDto) {
        // 1. Проверяем, что пост существует и это EVENT
        const post = await this.prisma.communityPost.findUnique({
            where: { id: dto.postId },
        });

        if (!post) throw new NotFoundException('Event post not found');
        if (post.postType !== 'EVENT') {
            throw new BadRequestException('Post is not an event');
        }

        // 2. Если указан petId — проверяем, что он принадлежит пользователю
        if (dto.petId) {
            const pet = await this.prisma.pet.findUnique({
                where: { id: dto.petId, userId },
            });
            if (!pet) throw new ForbiddenException('Pet does not belong to you');
        }

        // 3. Проверяем, не участвует ли уже пользователь (с этим питомцем)
        const existing = await this.prisma.eventParticipation.findFirst({
            where: {
                postId: dto.postId,
                userId,
                petId: dto.petId,
            },
        });

        if (existing) {
            throw new BadRequestException('You are already participating');
        }

        // 4. Создаём запись
        return this.prisma.eventParticipation.create({
            data: {
                postId: dto.postId,
                userId,
                petId: dto.petId,
                status: dto.status || 'CONFIRMED',
                joinedAt: new Date(),
            },
            include: {
                user: { select: { id: true, name: true } },
                pet: { select: { id: true, name: true } },
            },
        });
    }

    async findAllForEvent(postId: number) {
        return this.prisma.eventParticipation.findMany({
            where: { postId },
            include: {
                user: { select: { id: true, name: true, avatarPath: true } },
                pet: { select: { id: true, name: true, animalType: true } },
            },
        });
    }

    async findOne(postId: number, userId: number, petId?: number) {
        const where: any = { postId, userId };
        if (petId !== undefined) where.petId = petId;

        const participation = await this.prisma.eventParticipation.findFirst({
            where,
        });

        if (!participation) throw new NotFoundException('Participation not found');
        return participation;
    }

    async updateParticipation(
        userId: number,
        postId: number,
        dto: UpdateEventParticipationDto,
        petId?: number,
    ) {
        const participation = await this.findOne(postId, userId, petId);

        // Только владелец может менять
        if (participation.userId !== userId) {
            throw new ForbiddenException();
        }

        return this.prisma.eventParticipation.update({
            where: { id: participation.id },
            data: dto,
        });
    }

    async removeParticipation(userId: number, postId: number, petId?: number) {
        const participation = await this.findOne(postId, userId, petId);

        if (participation.userId !== userId) {
            throw new ForbiddenException();
        }

        return this.prisma.eventParticipation.delete({
            where: { id: participation.id },
        });
    }

    // Для организатора: кто участвует в моём событии?
    async getParticipantsForUserEvent(ownerId: number, postId: number) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId, authorId: ownerId },
        });

        if (!post) throw new ForbiddenException('Not your event');

        return this.findAllForEvent(postId);
    }
}