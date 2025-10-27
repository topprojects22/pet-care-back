// src/pet-boarding/booking.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class BookingService {
    constructor(private prisma: PrismaService) {}

    async createBooking(userId: number, boardingId: number, dto: CreateBookingDto) {
        const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId, userId } });
        if (!pet) throw new ForbiddenException('Pet not found or not yours');

        const boarding = await this.prisma.petBoarding.findUnique({
            where: { id: boardingId, isActive: true },
        });
        if (!boarding) throw new NotFoundException('Boarding not available');

        if (dto.startDate >= dto.endDate) {
            throw new BadRequestException('End date must be after start date');
        }

        // Проверка доступности мест (упрощённо)
        const existingBookings = await this.prisma.petBoardingBooking.count({
            where: {
                boardingId,
                status: 'CONFIRMED',
                OR: [
                    { startDate: { lte: dto.endDate }, endDate: { gte: dto.startDate } },
                ],
            },
        });

        if (existingBookings >= boarding.capacity) {
            throw new BadRequestException('No available spots');
        }

        const totalPrice = boarding.pricePerDay * Math.ceil((dto.endDate.getTime() - dto.startDate.getTime()) / (1000 * 60 * 60 * 24));

        return this.prisma.petBoardingBooking.create({
        data: {
        ...dto,
            userId,
            boardingId,
            totalPrice,
            status: 'PENDING',
            paymentStatus: 'PENDING',
        },
        include: {
            pet: { select: { id: true, name: true } },
            boarding: { select: { id: true, name: true } },
        },
    });
    }

    async confirmBooking(userId: number, bookingId: number) {
        const booking = await this.prisma.petBoardingBooking.findUnique({
            where: { id: bookingId },
        });
        if (!booking) throw new NotFoundException('Booking not found');

        // Владелец питомца или владелец передержки могут подтвердить
        const isPetOwner = booking.userId === userId;
        const isBoardingOwner = await this.prisma.petBoarding.findFirst({
            where: { id: booking.boardingId, userId },
        });

        if (!isPetOwner && !isBoardingOwner) {
            throw new ForbiddenException('Not authorized');
        }

        return this.prisma.petBoardingBooking.update({
            where: { id: bookingId },
        data: { status: 'CONFIRMED' },
    });
    }

    async cancelBooking(userId: number, bookingId: number) {
        const booking = await this.prisma.petBoardingBooking.findUnique({ where: { id: bookingId }, include: { boarding: true }  });
        if (!booking || (booking.userId !== userId && booking.boarding.userId !== userId)) {
            throw new ForbiddenException('Not authorized');
        }
        return this.prisma.petBoardingBooking.update({
            where: { id: bookingId },
        data: { status: 'CANCELLED' },
    });
    }

    async getBookingsForUser(userId: number, role: 'owner' | 'guest') {
        if (role === 'guest') {
            return this.prisma.petBoardingBooking.findMany({
                where: { userId },
                include: { pet: true, boarding: true },
            });
        } else {
            const boardings = await this.prisma.petBoarding.findMany({
                where: { userId },
                select: { id: true },
            });
            const boardingIds = boardings.map(b => b.id);
            return this.prisma.petBoardingBooking.findMany({
                where: { boardingId: { in: boardingIds } },
                include: { user: true, pet: true, boarding: true },
            });
        }
    }
}