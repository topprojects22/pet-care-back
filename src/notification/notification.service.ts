// src/notification/notification.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from '@prisma/client';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createNotification(userId: number, dto: CreateNotificationDto) {
    // Создаём уведомление
    const notification = await this.prisma.notification.create({
    data: {
    ...dto,
        userId,
        isCompleted: false,
        isConfirmed: false,
    },
  });

    // Привязываем питомцев, если указаны
    if (dto.petIds && dto.petIds.length > 0) {
      // Проверяем, что все питомцы принадлежат пользователю
      const pets = await this.prisma.pet.findMany({
        where: { id: { in: dto.petIds }, userId },
        select: { id: true },
      });

      if (pets.length !== dto.petIds.length) {
        throw new ForbiddenException('Some pets do not belong to you');
      }

      await this.prisma.petOnNotification.createMany({
        data: pets.map(pet => ({
          petId: pet.id,
          notificationId: notification.id,
          assignedBy: 'user',
        })),
      });
    }

    return this.findOne(notification.id);
  }

  async findAllForUser(userId: number, isCompleted?: boolean, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (isCompleted !== undefined) where.isCompleted = isCompleted;

    return this.prisma.notification.findMany({
      where,
      include: {
        petOnNotification: { include: { pet: { select: { id: true, name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  async findOne(id: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        petOnNotification: { include: { pet: { select: { id: true, name: true } } } },
      },
    });

    if (!notification) throw new NotFoundException('Notification not found');
    return notification;
  }

  async updateNotification(userId: number, id: number, dto: UpdateNotificationDto) {
    const notification = await this.findOne(id);

    if (notification.userId !== userId) {
      throw new ForbiddenException('Not your notification');
    }

    return this.prisma.notification.update({
      where: { id },
      data: dto,
    });
  }

  async markAsCompleted(userId: number, id: number) {
    return this.updateNotification(userId, id, { isCompleted: true });
  }

  async confirmNotification(userId: number, id: number) {
    return this.prisma.notification.update({
      where: { id, userId },
      data: { isConfirmed: true, confirmationDate: new Date() },
    });
  }
}