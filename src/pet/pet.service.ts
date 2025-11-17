import { Injectable, Req } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePetDto, UpdatePetDto, CreatePetPassportDto } from './dto/pet.dto';

@Injectable()
export class PetService {
  constructor(private prisma: PrismaService) {}

  // Получение всех питомцев пользователя (для главного экрана)
  async getUserPets(userId: number) {
    return this.prisma.pet.findMany({
      where: { userId },
      include: {
        animalType: true,
        petPassport: true,
        photos: {
          where: { isPrimary: true },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Получение детальной информации о питомце (для экрана карточки)
  async getPetWithDetails(id: number) {
    return this.prisma.pet.findUnique({
      where: { id },
      include: {
        animalType: {
          include: {
            animalBreed: true
          }
        },
        petPassport: {
          include: {
            breed: true
          }
        },
        petCard: true,
        medications: {
          orderBy: { startDate: 'desc' }
        },
        vaccinations: {
          include: {
            clinic: true
          },
          orderBy: { date: 'desc' }
        },
        photos: {
          orderBy: { isPrimary: 'desc' }
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



