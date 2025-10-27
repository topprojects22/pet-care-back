// src/pet-card/services/pet-card-updater.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PetCardUpdaterService {
    constructor(private prisma: PrismaService) {}

    async updateAfterVetVisit(petId: number, visitDate: Date, nextVisitDate?: Date) {
        await this.prisma.petCard.upsert({
            where: { petId },
            update: {
                lastVetVisit: visitDate,
                nextVetVisit: nextVisitDate,
                status: nextVisitDate ? 'наблюдение' : 'здоров',
            },
            create: {
                petId,
                status: 'здоров',
                health: 'после осмотра',
                vaccine: '',
                totalSpent: 0,
                lastVetVisit: visitDate,
                nextVetVisit: nextVisitDate,
            },
        });
    }

    async updateAfterPayment(petId: number, amount: number) {
        // Найти карту или создать
        const card = await this.prisma.petCard.findUnique({ where: { petId } });
        if (!card) return; // или создать — по логике приложения

        await this.prisma.petCard.update({
            where: { petId },
            data: {
                totalSpent: { increment: amount },
            },
        });
    }
}