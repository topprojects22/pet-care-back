// src/notification/notification.scheduler.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationSchedulerService {
    constructor(private prisma: PrismaService) {}

    // Пример: создать напоминание за 24 часа до визита
    async createVetVisitReminder(visitId: number, petId: number, visitDate: Date) {
        const userId = await this.getPetOwnerId(petId);
        if (!userId) return;

        const reminderDate = new Date(visitDate);
        reminderDate.setHours(reminderDate.getHours() - 24);

        if (reminderDate <= new Date()) return; // уже прошло

        const notification = await this.prisma.notification.create({
        data: {
            name: 'Напоминание о визите к ветеринару',
                description: `Ваш питомец записан на приём ${visitDate.toLocaleDateString()}`,
            type: 'HIGH',
            expiriedAt: visitDate,
            userId,
            isCompleted: false,
            isConfirmed: false,
        },
    });

        await this.prisma.petOnNotification.create({
        data: { petId, notificationId: notification.id, assignedBy: 'system' },
    });
    }

    private async getPetOwnerId(petId: number): Promise<number | null> {
        const pet = await this.prisma.pet.findUnique({ where: { id: petId }, select: { userId: true } });
        return pet?.userId || null;
    }

    // В NotificationSchedulerService
    async scheduleMedicationReminders(medicationId: number, petId: number, frequency: string) {
        // Парсинг частоты → генерация cron-подобных задач
        // Используйте agenda, bull или просто cron-сервис
        // расширить NotificationSchedulerService, чтобы при создании лекарства автоматически генерировались напоминания:
    }

    // В NotificationSchedulerService , Вызывайте это из VaccinationService.createVaccination, если dto.nextDate задан.
    async scheduleVaccinationReminder(petId: number, nextDate: Date, vaccineName: string) {
        const userId = await this.getPetOwnerId(petId);
        if (!userId || nextDate <= new Date()) return;

        const notification = await this.prisma.notification.create({
        data: {
            name: `Напоминание: прививка "${vaccineName}"`,
                description: `Пора сделать ревакцинацию вашему питомцу`,
            type: 'MEDIUM',
            expiriedAt: nextDate,
            userId,
            isCompleted: false,
        },
    });

        await this.prisma.petOnNotification.create({
        data: { petId, notificationId: notification.id, assignedBy: 'system' },
    });
    }

    async scheduleGroomingReminder(petId: number, nextDate: Date, serviceType: string) {
        const userId = await this.getPetOwnerId(petId);
        if (!userId || nextDate <= new Date()) return;

        await this.prisma.notification.create({
        data: {
            name: `Напоминание: ${serviceType} для питомца`,
                description: `Пора записаться на следующую процедуру`,
            type: 'MEDIUM',
            expiriedAt: nextDate,
            userId,
            isCompleted: false,
        },
    });
    }
}