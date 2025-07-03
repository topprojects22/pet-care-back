import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import { ChangePasswordDto } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Получение профиля пользователя
  async getUserProfile(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        pets: {
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            photos: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        preferredClinics: {
          take: 3,
        },
      },
    });
  }

  // Обновление профиля пользователя
  async updateUserProfile(id: number, userData: any) {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  // Получение настроек пользователя
  async getUserPreferences(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { preferences: true },
    });
    return user.preferences;
  }

  // Обновление настроек пользователя
  async updateUserPreferences(id: number, preferences: any) {
    return this.prisma.user.update({
      where: { id },
      data: { preferences },
    });
  }

  // Получение избранных клиник
  async getUserFavoriteClinics(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        preferredClinics: true,
      },
    });
  }

  // Добавление клиники в избранное
  async addFavoriteClinic(userId: number, clinicId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredClinics: {
          connect: { id: clinicId },
        },
      },
    });
  }

  // Удаление клиники из избранного
  async removeFavoriteClinic(userId: number, clinicId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredClinics: {
          disconnect: { id: clinicId },
        },
      },
    });
  }

  async changePassword(userId: number, passwordData: ChangePasswordDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: passwordData.newPassword },
    });
  }

  async toggleFavoriteClinic(userId: number, clinicId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { preferredClinics: { where: { id: clinicId } } },
    });
    if (user.preferredClinics.length === 0) {
      return this.addFavoriteClinic(userId, clinicId);
    }
    return this.removeFavoriteClinic(userId, clinicId);
  }
}
