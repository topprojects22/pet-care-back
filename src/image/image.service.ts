import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { returnImageObject } from './dto/return-image.object';
import { returnUserObject } from '../auth/dto/return-user.object';
import { slugify } from '../utils/generate-slug';

@Injectable()
export class ImageService {
  constructor(private readonly prisma: PrismaService) {}
  async getAll() {
    return await this.prisma.image.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        ...returnImageObject,
        user: {
          select: {
            ...returnUserObject,
          },
        },
      },
    });
  }
  async getImage(imageId: number) {
    return await this.prisma.image.findUnique({
      where: {
        id: imageId,
      },
      select: {
        ...returnImageObject,
        user: {
          select: {
            ...returnUserObject,
          },
        },
      },
    });
  }
  async getImageByUserId(userId: number) {
    return await this.prisma.image.findMany({
      where: {
        userId: userId,
      },
      select: {
        ...returnImageObject,
      },
    });
  }
  async deleteImage(imageId: number) {
    return await this.prisma.image.delete({
      where: {
        id: imageId,
      },
    });
  }
  async createImage(userId: number, name: string) {
    return await this.prisma.image.create({
      data: {
        name,
        slug: slugify(name),
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
