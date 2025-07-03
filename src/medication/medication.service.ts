import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  async getPetMedications(petId: number) {
    return this.prisma.medication.findMany({
      where: { petId },
      orderBy: { startDate: "desc" },
    });
  }

  async addMedication(petId: number, medicationData: any) {
    return this.prisma.medication.create({
      data: {
        ...medicationData,
        petId,
      },
    });
  }

  async updateMedication(id: number, medicationData: any) {
    return this.prisma.medication.update({
      where: { id },
      data: medicationData,
    });
  }

  async deleteMedication(id: number) {
    return this.prisma.medication.delete({
      where: { id },
    });
  }
}
