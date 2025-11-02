// src/pet-photo/pet-photo.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { CreatePetPhotoDto } from "./dto/create-pet-photo.dto";
import { UpdatePetPhotoDto } from "./dto/update-pet-photo.dto";

@Injectable()
export class PetPhotoService {
  constructor(private prisma: PrismaService) {}

  // ✅ Обновлён: url теперь отдельный параметр
  async createPhoto(
    userId: number,
    petId: number,
    url: string,
    dto?: Pick<CreatePetPhotoDto, "isPrimary">
  ) {
    const pet = await this.prisma.pet.findUnique({
      where: { id: petId, userId },
    });
    if (!pet) throw new ForbiddenException("Pet not found or not yours");

    const isPrimary = dto?.isPrimary ?? false;

    // Если устанавливается isPrimary = true — снимаем флаг с других фото
    if (isPrimary) {
      await this.prisma.petPhoto.updateMany({
        where: { petId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const photo = await this.prisma.petPhoto.create({
      data: {
        url,
        isPrimary,
        petId,
      },
      include: { pet: { select: { id: true, name: true } } },
    });

    // Обновляем avatarPath у питомца, если фото главное
    if (isPrimary) {
      await this.prisma.pet.update({
        where: { id: petId },
        data: { avatarPath: url },
      });
    }

    return photo;
  }

  async findAllForPet(petId: number) {
    return this.prisma.petPhoto.findMany({
      where: { petId },
      orderBy: { createdAt: "desc" },
      include: { pet: { select: { id: true, name: true } } },
    });
  }

  async findOne(id: number) {
    const photo = await this.prisma.petPhoto.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException("Photo not found");
    return photo;
  }

  async updatePhoto(userId: number, id: number, dto: UpdatePetPhotoDto) {
    const photo = await this.findOne(id);
    const pet = await this.prisma.pet.findUnique({
      where: { id: photo.petId },
      select: { userId: true },
    });
    if (pet.userId !== userId) throw new ForbiddenException("Not your pet");

    // Если устанавливается isPrimary = true — снимаем с других
    if (dto.isPrimary) {
      await this.prisma.petPhoto.updateMany({
        where: { petId: photo.petId, isPrimary: true, NOT: { id } },
        data: { isPrimary: false },
      });

      // Обновляем avatarPath
      await this.prisma.pet.update({
        where: { id: photo.petId },
        data: { avatarPath: photo.url },
      });
    }

    return this.prisma.petPhoto.update({
      where: { id },
      data: dto,
    });
  }

  async removePhoto(userId: number, id: number) {
    const photo = await this.findOne(id);
    const pet = await this.prisma.pet.findUnique({
      where: { id: photo.petId },
      select: { userId: true },
    });
    if (pet.userId !== userId) throw new ForbiddenException("Not your pet");

    // Если удаляется главное фото — сбрасываем avatarPath на дефолт
    if (photo.isPrimary) {
      await this.prisma.pet.update({
        where: { id: photo.petId },
        data: { avatarPath: "uploads/default-avatar.png" },
      });
    }

    return this.prisma.petPhoto.delete({ where: { id } });
  }

  async setPrimary(userId: number, photoId: number) {
    const photo = await this.findOne(photoId);
    const pet = await this.prisma.pet.findUnique({
      where: { id: photo.petId },
      select: { userId: true },
    });
    if (pet.userId !== userId) throw new ForbiddenException("Not your pet");

    // Снимаем isPrimary с других
    await this.prisma.petPhoto.updateMany({
      where: { petId: photo.petId, isPrimary: true },
      data: { isPrimary: false },
    });

    // Устанавливаем новое главное фото
    await this.prisma.petPhoto.update({
      where: { id: photoId },
      data: { isPrimary: true },
    });

    // Обновляем avatarPath
    await this.prisma.pet.update({
      where: { id: photo.petId },
      data: { avatarPath: photo.url },
    });

    return photo;
  }
}
