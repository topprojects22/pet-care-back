import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreateGroomingBookingDto } from "./dto/grooming.dto";

@Injectable()
export class GroomingService {
  constructor(private prisma: PrismaService) {}

  // Получение услуг груминга
  async getGroomingServices() {
    return this.prisma.service.findMany({
      where: {
        category: "GROOMING",
      },
      include: {
        clinic: true,
      },
    });
  }

  // Запись на груминг
  async createGroomingBooking(bookingData: CreateGroomingBookingDto) {
    return this.prisma.groomingRecord.create({
      data: {
        pet: { connect: { id: bookingData.petId } },
        serviceType: bookingData.serviceType,
        date: bookingData.date,
        notes: bookingData.notes,
        status: bookingData.status,
      },
    });
  }

  // История груминга питомца
  async getPetGroomingHistory(petId: number) {
    return this.prisma.groomingRecord.findMany({
      where: { petId },
      orderBy: { date: "desc" },
    });
  }
}
