import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePetDto, UpdatePetDto, CreatePetPassportDto } from './dto/pet.dto';
import { PassportPdfService } from './services/passport-pdf.service';
import { createPaginatedResponse } from '../common/utils/response.util';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService) {}

  // Получение всех питомцев пользователя (для главного экрана) с пагинацией и фильтрацией
  async getUserPets(
    userId: number,
    page: number = 1,
    limit: number = 20,
    type?: string,
    sort: string = 'createdAt',
    order: 'asc' | 'desc' = 'desc'
  ) {
    const skip = (page - 1) * limit;

    // Формируем условие WHERE
    const where: any = { userId };
    
    // Фильтр по типу животного
    if (type) {
      where.animalType = {
        name: {
          contains: type,
          mode: 'insensitive',
        },
      };
    }

    // Формируем сортировку
    const orderBy: any = {};
    if (sort === 'name') {
      orderBy.name = order;
    } else if (sort === 'birthDate') {
      orderBy.birthDate = order;
    } else {
      orderBy.createdAt = order;
    }

    // Получаем данные с пагинацией (оптимизированный запрос с select)
    const [pets, total] = await Promise.all([
      this.prisma.pet.findMany({
        where,
        select: {
          id: true,
          name: true,
          birthDate: true,
          gender: true,
          weight: true,
          color: true,
          avatarPath: true,
          createdAt: true,
          animalType: {
            select: {
              id: true,
              name: true,
            },
          },
          petPassport: {
            select: {
              id: true,
              chip: true,
            },
          },
          photos: {
            where: { isPrimary: true },
            take: 1,
            select: {
              id: true,
              url: true,
              isPrimary: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.pet.count({ where }),
    ]);

    return createPaginatedResponse(pets, page, limit, total);
  }

  // Получение детальной информации о питомце (для экрана карточки)
  // Оптимизировано с использованием select для уменьшения объема данных
  async getPetWithDetails(id: number) {
    return this.prisma.pet.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        weight: true,
        color: true,
        avatarPath: true,
        isSterilized: true,
        createdAt: true,
        updatedAt: true,
        animalType: {
          select: {
            id: true,
            name: true,
            animalBreed: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        petPassport: {
          select: {
            id: true,
            chip: true,
            chipInstallDate: true,
            tattooNumber: true,
            specialMarks: true,
            issuingOrganization: true,
            registrationNumber: true,
            qrCode: true,
            breed: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        petCard: {
          select: {
            id: true,
            cardNumber: true,
            issueDate: true,
            expiryDate: true,
          },
        },
        medications: {
          select: {
            id: true,
            name: true,
            dosage: true,
            frequency: true,
            startDate: true,
            endDate: true,
            notes: true,
          },
          orderBy: { startDate: 'desc' },
        },
        vaccinations: {
          select: {
            id: true,
            name: true,
            date: true,
            nextDate: true,
            description: true,
            clinic: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
        photos: {
          select: {
            id: true,
            url: true,
            isPrimary: true,
            createdAt: true,
          },
          orderBy: { isPrimary: 'desc' },
        },
        healthMetrics: {
          orderBy: { measuredAt: 'desc' },
          take: 10
        },
        groomingRecords: {
          orderBy: { date: 'desc' }
        }
      }
    });
  }

  // Создание нового питомца
  async createPet(petData: CreatePetDto, userId: number) {
    return this.prisma.pet.create({
      data: {
        ...petData,
        userId: userId,
        photos: petData.photos ? {
          createMany: {
            data: petData.photos.map((url, index) => ({
              url,
              isPrimary: index === 0
            }))
          }
        } : undefined
      }
    });
  }

  // Обновление информации о питомце
  async updatePet(id: number, petData: UpdatePetDto) {
    return this.prisma.pet.update({
      where: { id },
      data: petData
    });
  }

  // Удаление питомца
  async deletePet(id: number) {
    return this.prisma.pet.delete({
      where: { id }
    });
  }

  // Работа с паспортом питомца
  async getPetPassport(petId: number) {
    return this.prisma.petPassport.findUnique({
      where: { petId }
    });
  }

  async createPetPassport(passportData: CreatePetPassportDto) {
    return this.prisma.petPassport.create({
      data: passportData
    });
  }

  async deletePetPassport(id: number) {
    return this.prisma.petPassport.delete({
      where: { id }
    });
  }

  // Работа с фотографиями питомца
  async addPetPhoto(petId: number, url: string, isPrimary: boolean = false) {
    return this.prisma.petPhoto.create({
      data: {
        petId,
        url,
        isPrimary
      }
    });
  }

  async setPrimaryPhoto(petId: number, photoId: number) {
    await this.prisma.petPhoto.updateMany({
      where: { petId },
      data: { isPrimary: false }
    });
    
    return this.prisma.petPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true }
    });
  }

  async deletePhoto(photoId: number) {
    return this.prisma.petPhoto.delete({
      where: { id: photoId }
    });
  }

  async getPetMedications(petId: number) {
    return this.prisma.medication.findMany({
      where: { petId },
      orderBy: { startDate: 'desc' }
    });
  }

  async getPetVaccinations(petId: number) {
    return this.prisma.vaccination.findMany({
      where: { petId },
      orderBy: { date: 'desc' }
    });
  }
}



