// src/medication/medication.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import {UpdateMedicationDto} from "./dto/medication.dto";

@Injectable()
export class MedicationService {
  constructor(private prisma: PrismaService) {}

  async createMedication(userId: number, petId: number, dto: CreateMedicationDto) {
    // Проверка: питомец принадлежит пользователю
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId, userId },
    });
    if (!pet) throw new ForbiddenException('Pet not found or not yours');

    return this.prisma.medication.create({
    data: {
    ...dto,
        petId,
    },
    include: { pet: { select: { id: true, name: true } } },
  });
  }

  async findAllForPet(petId: number, activeOnly = false) {
    const where: any = { petId };
    if (activeOnly) {
      where.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } },
      ];
    }

    return this.prisma.medication.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: { pet: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: number) {
    const med = await this.prisma.medication.findUnique({ where: { id } });
    if (!med) throw new NotFoundException('Medication not found');
    return med;
  }

  async updateMedication(userId: number, id: number, dto: UpdateMedicationDto) {
    const med = await this.findOne(id);

    // Проверка прав через питомца
    const pet = await this.prisma.pet.findUnique({
      where: { id: med.petId },
      select: { userId: true },
    });
    if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

    return this.prisma.medication.update({
      where: { id },
      dto,
    });
  }

  async removeMedication(userId: number, id: number) {
    const med = await this.findOne(id);
    const pet = await this.prisma.pet.findUnique({
      where: { id: med.petId },
      select: { userId: true },
    });
    if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

    return this.prisma.medication.delete({ where: { id } });
  }
}