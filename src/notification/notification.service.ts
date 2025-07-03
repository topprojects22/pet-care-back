import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Получение уведомлений пользователя
  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      include: {
        petOnNotification: {
          include: {
            pet: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Получение событий для календаря
  async getCalendarEvents(userId: number, startDate: string, endDate: string) {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    return this.prisma.notification.findMany({
      where: {
        userId,
        OR: [
          // TODO убрать хардкод
          { expiriedAt: { gte: now, lte: nextMonth } },
          { repeatPattern: { not: null } }
        ]
      },
      include: {
        petOnNotification: {
          include: {
            pet: true
          }
        }
      }
    });
  }

  // Создание уведомления
  async createNotification(notificationData: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        ...notificationData,
        petOnNotification: notificationData.petId ? {
          create: {
            petId: notificationData.petId,
            assignedBy: 'user'
          }
        } : undefined
      }
    });
  }

  // Обновление уведомления
  async updateNotification(id: number, notificationData: UpdateNotificationDto) {
    return this.prisma.notification.update({
      where: { id },
      data: notificationData
    });
  }

  // Удаление уведомления
  async deleteNotification(id: number) {
    return this.prisma.notification.delete({
      where: { id }
    });
  }

  // Отметить как выполненное
  async markAsCompleted(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isCompleted: true, confirmationDate: new Date() }
    });
  }

  // Получение уведомлений для питомца
  async getPetNotifications(petId: number) {
    return this.prisma.notification.findMany({
      where: {
        petOnNotification: {
          some: { petId }
        }
      },
      orderBy: { expiriedAt: 'asc' }
    });
  }
}