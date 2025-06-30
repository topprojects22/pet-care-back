import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { returnUserObject } from '../auth/dto/return-user.object';
import { UpdateProfileDto } from './dto/user.dto';
import { Prisma } from '@prisma/client';
import { hash } from 'argon2';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserProfile(id: number, selectObject: Prisma.UserSelect = {}) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        ...returnUserObject,
        role: {
          select: {
            name: true,
          },
        },
        ...selectObject,
      },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
  async updateProfile(id: number, updateProfileDto: UpdateProfileDto) {
    const isSameUser = await this.prisma.user.findUnique({
      where: { email: updateProfileDto.email },
    });
    if (isSameUser && id !== isSameUser.id) {
      throw new BadRequestException('Email already in use');
    }
    const user = await this.getUserProfile(id);
    return await this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        email: updateProfileDto.email,
        name: updateProfileDto.name,
        avatarPath: updateProfileDto.avatarPath,
        phone: updateProfileDto.phone,
        password: updateProfileDto.password
          ? await hash(updateProfileDto.password)
          : user.password,
      },
    });
  }

  async getAllUsers() {
    return [];
  }
}
