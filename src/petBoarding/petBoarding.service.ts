import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateBoardingBookingDto } from "./dto/pet-boarding.dto";

@Injectable()
export class PetBoardingService {
  constructor(private prisma: PrismaService) {}

  // Получение всех зоогостиниц
  async getAllPetBoardings(searchParams: string) {
    return this.prisma.petBoarding.findMany({
      include: {
        reviews: {
          take: 3,
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  // Получение деталей зоогостиницы
  async getBoardingDetails(id: number) {
    return this.prisma.petBoarding.findUnique({
      where: { id },
      include: {
        staff: true,
        reviews: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  // Бронирование передержки
  async createBoardingBooking(bookingData: CreateBoardingBookingDto) {
    const days = Math.ceil(
      (bookingData.endDate.getTime() - bookingData.startDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const boarding = await this.prisma.petBoarding.findUnique({
      where: { id: bookingData.boardingId },
    });

    if (!boarding) {
      throw new NotFoundException('Boarding not found');
    }

    const totalPrice = boarding.pricePerDay * days;

    return this.prisma.petBoardingBooking.create({
      data: {
        pet: {
          connect: {
            id: bookingData.petId,
          },
        },
        boarding: {
          connect: {
            id: bookingData.boardingId,
          },
        },
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        status: "PENDING",
        totalPrice: totalPrice,
        user: {
          connect: {
            id: bookingData.userId,
          },
        },
        specialRequests: bookingData.specialRequests,
      },
    });
  }

  // Получение бронирований пользователя
  async getUserBookings(userId: number) {
    return this.prisma.petBoardingBooking.findMany({
      where: { userId },
      include: {
        boarding: true,
        pet: true,
      },
      orderBy: { startDate: "desc" },
    });
  }

  // Отмена бронирования
  async cancelBooking(id: number) {
    return this.prisma.petBoardingBooking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }
}
