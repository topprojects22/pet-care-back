// src/payment/payment.service.ts
import {
    Injectable,
    NotFoundException,
    BadRequestException,
    GoneException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { randomBytes } from 'crypto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { createPaginatedResponse } from '../common/utils/response.util';

@Injectable()
export class PaymentService {
    constructor(private prisma: PrismaService) {}

    async createPayment(userId: number, dto: CreatePaymentDto) {
        // Генерация номера счёта, если не задан
        const randomId = randomBytes(4).toString('hex').toUpperCase();
        const invoiceNumber = dto.invoiceNumber || `INV-${Date.now()}-${randomId}`;

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
            select: {
                id: true,
                amount: true,
                method: true,
                status: true,
                invoiceNumber: true,
                paymentDate: true,
                service: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
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

    /**
     * Создание платежной сессии
     */
    async createPaymentSession(userId: number, dto: CreatePaymentSessionDto) {
        // Получаем цену услуги, если указан serviceId
        let amount = 0;
        if (dto.serviceId) {
            const service = await this.prisma.service.findUnique({
                where: { id: dto.serviceId },
            });
            if (!service) {
                throw new NotFoundException('Service not found');
            }
            amount = service.price;
        } else {
            // Если serviceId не указан, нужно получить цену из metadata или другого источника
            // Для примера, можно использовать фиксированную цену или получать из metadata
            throw new BadRequestException('Service ID is required or amount must be specified');
        }

        // Генерируем уникальный ID сессии
        const sessionId = `session_${randomBytes(16).toString('hex')}`;

        // Время истечения: 2 часа
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2);

        // Определяем доступные методы оплаты
        const paymentMethods = ['card', 'apple_pay', 'google_pay'];

        // Создаем платежную сессию
        const session = await (this.prisma as any).paymentSession.create({
            data: {
                id: sessionId,
                userId,
                amount,
                currency: 'RUB',
                description: `Оплата услуги: ${dto.serviceType}`,
                serviceId: dto.serviceId,
                serviceType: dto.serviceType,
                metadata: dto.metadata || {},
                expiresAt,
                paymentMethods,
                status: 'PENDING',
            },
        });

        return {
            id: session.id,
            amount: session.amount,
            currency: session.currency,
            description: session.description,
            status: session.status,
            expiresAt: session.expiresAt,
            serviceType: session.serviceType,
            paymentMethods: session.paymentMethods,
        };
    }

    /**
     * Обработка платежа
     */
    async processPayment(sessionId: string, userId: number, dto: ProcessPaymentDto) {
        // Находим сессию
        const session = await (this.prisma as any).paymentSession.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            throw new NotFoundException('Payment session not found');
        }

        // Проверяем владение сессией
        if (session.userId !== userId) {
            throw new BadRequestException('You do not have access to this session');
        }

        // Проверяем срок действия сессии
        if (new Date() > session.expiresAt) {
            await (this.prisma as any).paymentSession.update({
                where: { id: sessionId },
                data: { status: 'EXPIRED' },
            });
            throw new GoneException('Payment session has expired');
        }

        // Проверяем, не обработан ли уже платеж
        if (session.status !== 'PENDING') {
            throw new ConflictException('Payment session has already been processed');
        }

        // Обновляем статус сессии на PROCESSING
        await (this.prisma as any).paymentSession.update({
            where: { id: sessionId },
            data: { status: 'PROCESSING' },
        });

        // TODO: Интеграция с платежными системами (Stripe, CloudPayments)
        // Здесь должна быть реальная обработка платежа
        // Для примера, симулируем успешный платеж

        // Генерируем transaction ID
        const transactionId = `txn_${randomBytes(12).toString('hex')}`;

        // Создаем запись о платеже
        const payment = await this.prisma.payment.create({
            data: {
                userId: session.userId,
                serviceId: session.serviceId,
                amount: session.amount,
                method: dto.paymentMethod.toUpperCase(),
                status: 'PAID',
                paymentDate: new Date(),
                invoiceNumber: `INV-${Date.now()}-${randomBytes(4).toString('hex').toUpperCase()}`,
            },
        });

        // Обновляем сессию
        await (this.prisma as any).paymentSession.update({
            where: { id: sessionId },
            data: {
                status: 'PAID',
                paymentId: payment.id,
                paidAt: new Date(),
            },
        });

        return {
            id: payment.id,
            sessionId: session.id,
            amount: payment.amount,
            currency: session.currency,
            status: 'processing',
            transactionId,
            createdAt: payment.paymentDate,
        };
    }

    /**
     * Получение истории транзакций пользователя
     */
    async getTransactions(
        userId: number,
        query: {
            page?: number;
            limit?: number;
            status?: string;
            serviceType?: string;
            fromDate?: string;
            toDate?: string;
            sortBy?: string;
            sortOrder?: string;
        },
    ) {
        const { page = 1, limit = 20, status, serviceType, fromDate, toDate, sortBy, sortOrder } = query;
        const skip = (page - 1) * limit;

        // Формируем условие WHERE
        const where: any = { userId };
        
        if (status) {
            where.status = status;
        }

        if (fromDate || toDate) {
            where.paymentDate = {};
            if (fromDate) {
                where.paymentDate.gte = new Date(fromDate);
            }
            if (toDate) {
                where.paymentDate.lte = new Date(toDate);
            }
        }

        // Если нужна фильтрация по типу услуги, нужно использовать PaymentSession
        if (serviceType) {
            const sessions = await (this.prisma as any).paymentSession.findMany({
                where: {
                    userId,
                    serviceType,
                    paymentId: { not: null },
                },
                select: { paymentId: true },
            });
            const paymentIds = sessions
                .map((s: { paymentId: number | null }) => s.paymentId)
                .filter((id: number | null): id is number => Boolean(id));
            where.id = { in: paymentIds };
        }

        // Получаем данные с пагинацией
        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    service: {
                        select: {
                            id: true,
                            name: true,
                            category: true,
                        },
                    },
                },
                orderBy: sortBy ? { [sortBy]: sortOrder || 'desc' } : { paymentDate: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.payment.count({ where }),
        ]);

        // Вычисляем общую сумму
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Получаем serviceType из PaymentSession для каждого платежа
        const paymentIds = payments.map(p => p.id);
        const sessions = paymentIds.length > 0
            ? await (this.prisma as any).paymentSession.findMany({
                where: { paymentId: { in: paymentIds } },
                select: { paymentId: true, serviceType: true },
            })
            : [];

        const sessionMap = new Map(
            (sessions as Array<{ paymentId: number; serviceType: string | null }>)
                .map(s => [s.paymentId, s.serviceType])
        );

        const data = payments.map(payment => ({
            id: payment.id,
            amount: payment.amount,
            currency: 'RUB',
            status: payment.status,
            serviceType: sessionMap.get(payment.id) || null,
            description: payment.service?.name || 'Payment',
            paymentMethod: payment.method,
            transactionId: payment.invoiceNumber,
            createdAt: payment.paymentDate,
            paidAt: payment.paymentDate,
            service: payment.service ? {
                id: payment.service.id,
                name: payment.service.name,
                category: payment.service.category,
            } : null,
        }));

        const response = createPaginatedResponse(data, page, limit, total);
        return {
            ...response,
            meta: {
                ...response.meta,
                totalAmount,
            },
        };
    }
}