// src/vaccination/vaccination.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import {UpdateVaccinationDto} from "./dto/update-vaccination.dto";

@Injectable()
export class VaccinationService {
  constructor(private prisma: PrismaService) {}

  async createVaccination(userId: number, petId: number, dto: CreateVaccinationDto) {
    // Проверка: питомец принадлежит пользователю
    const pet = await this.prisma.pet.findUnique({ where: { id: petId, userId } });
    if (!pet) throw new ForbiddenException('Pet not found or not yours');

    // Проверка клиники (если указана)
    if (dto.clinicId) {
      const clinic = await this.prisma.clinic.findUnique({ where: { id: dto.clinicId } });
      if (!clinic) throw new BadRequestException('Clinic not found');
    }

    return this.prisma.vaccination.create({
    data: {
    ...dto,
        petId,
    },
    include: {
      pet: { select: { id: true, name: true } },
      clinic: dto.clinicId ? true : false,
    },
  });
  }

  async findAllForPet(petId: number, includeFuture = false) {
    const where: any = { petId };
    if (!includeFuture) {
      where.date = { lte: new Date() }; // только прошедшие
    }

    return this.prisma.vaccination.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        clinic: true,
        pet: { select: { id: true, name: true } },
      },
    });
  }

  async findOne(id: number) {
    const vac = await this.prisma.vaccination.findUnique({ where: { id } });
    if (!vac) throw new NotFoundException('Vaccination record not found');
    return vac;
  }

  async updateVaccination(userId: number, id: number, dto: UpdateVaccinationDto) {
    const vac = await this.findOne(id);
    const pet = await this.prisma.pet.findUnique({
      where: { id: vac.petId },
      select: { userId: true },
    });
    if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

    return this.prisma.vaccination.update({
      where: { id },
      data: dto,
    });
  }

  async removeVaccination(userId: number, id: number) {
    const vac = await this.findOne(id);
    const pet = await this.prisma.pet.findUnique({
      where: { id: vac.petId },
      select: { userId: true },
    });
    if (pet.userId !== userId) throw new ForbiddenException('Not your pet');

    return this.prisma.vaccination.delete({ where: { id } });
  }
}