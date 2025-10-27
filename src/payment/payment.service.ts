// src/payment/payment.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { v4 as uuidv4 } from 'uuid';
import {UpdatePaymentStatusDto} from "./dto/update-payment-status.dto";

@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService) {}

    async createPayment(userId: number, dto: CreatePaymentDto) {
        // Генерация номера счёта, если не задан
        const invoiceNumber = dto.invoiceNumber || `INV-${Date.now()}-${uuidv4().slice(0, 8).toUpperCase()}`;

        // Проверка услуги (если указана)
        if (dto.serviceId) {
            const service = await this.prisma.service.findUnique({ where: { id: dto.serviceId } });
            if (!service) throw new BadRequestException('Service not found');
        }

        return this.prisma.payment.create({
        data: {
        ...dto,
            userId,
            invoiceNumber,
            status: 'completed', // если оплата прошла вне системы (например, наличные)
            paymentDate: new Date(),
        },
        include: {
            user: { select: { id: true, name: true } },
            service: dto.serviceId ? true : false,
        },
    });
    }

    // Метод для внешнего платёжного шлюза (например, после вебхука от Stripe)
    async handleExternalPayment(payload: {
        userId: number;
        amount: number;
        method: 'ONLINE';
        externalId: string;
        status: 'PAID' | 'FAILED';
        serviceId?: number;
    }) {
        const invoiceNumber = `EXT-${payload.externalId}`;

        return this.prisma.payment.create({
        data: {
            userId: payload.userId,
                amount: payload.amount,
            method: 'ONLINE',
            serviceId: payload.serviceId,
            invoiceNumber,
            status: payload.status === 'PAID' ? 'PAID' : 'FAILED',
            paymentDate: new Date(),
        },
    });
    }

    async findAllForUser(userId: number, status?: string) {
        return this.prisma.payment.findMany({
            where: { userId, ...(status && { status }) },
            orderBy: { paymentDate: 'desc' },
            include: {
                service: true,
            },
        });
    }

    async findOne(id: number) {
        const payment = await this.prisma.payment.findUnique({ where: { id } });
        if (!payment) throw new NotFoundException('Payment not found');
        return payment;
    }

    async updatePaymentStatus(id: number, dto: UpdatePaymentStatusDto) {
        return this.prisma.payment.update({
            where: { id },
            data: dto,
        });
    }
}