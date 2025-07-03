import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class VaccinationService {
  constructor(private prisma: PrismaService) {}

  async getPetVaccinations(petId: number) {
    return this.prisma.vaccination.findMany({
      where: { petId },
      include: {
        clinic: true,
      },
      orderBy: { date: "desc" },
    });
  }

  async addVaccination(petId: number, vaccinationData: any) {
    return this.prisma.vaccination.create({
      data: {
        ...vaccinationData,
        petId,
      },
    });
  }

  async deleteVaccination(id: number) {
    return this.prisma.vaccination.delete({
      where: { id },
    });
  }
}
