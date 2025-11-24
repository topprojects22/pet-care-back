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

  async findAllForPet(
    petId: number,
    query: {
      page?: number;
      limit?: number;
      includeFuture?: boolean;
      upcoming?: boolean;
      overdue?: boolean;
      sortBy?: string;
      sortOrder?: string;
    },
  ) {
    const { page = 1, limit = 20, includeFuture, upcoming, overdue, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;
    const now = new Date();

    // Формируем условие WHERE
    const where: any = { petId };
    
    if (upcoming) {
      // Только предстоящие вакцинации
      where.nextDate = { gte: now };
    } else if (overdue) {
      // Только просроченные
      where.nextDate = { lt: now };
    } else if (!includeFuture) {
      // По умолчанию только прошедшие вакцинации
      where.date = { lte: now };
    }

    // Определяем сортировку
    const orderBy: any = {};
    if (sortBy) {
      orderBy[sortBy] = sortOrder || 'desc';
    } else {
      orderBy.date = 'desc';
    }

    // Оптимизированный запрос с select
    const [vaccinations, total] = await Promise.all([
      this.prisma.vaccination.findMany({
        where,
        select: {
          id: true,
          name: true,
          date: true,
          nextDate: true,
          description: true,
          files: true,
          createdAt: true,
          clinic: { select: { id: true, name: true, address: true } },
          pet: { select: { id: true, name: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.vaccination.count({ where }),
    ]);

    // Добавляем флаг isOverdue для каждой вакцинации
    const vaccinationsWithOverdue = vaccinations.map(vaccination => ({
      ...vaccination,
      isOverdue: vaccination.nextDate ? vaccination.nextDate < now : false,
    }));

        return createPaginatedResponse(vaccinationsWithOverdue, page, limit, total);
  }

  async findOne(id: number) {
    const vac = await this.prisma.vaccination.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        date: true,
        nextDate: true,
        description: true,
        files: true,
        createdAt: true,
        updatedAt: true,
        clinic: { select: { id: true, name: true, address: true } },
        pet: { select: { id: true, name: true } },
      },
    });
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