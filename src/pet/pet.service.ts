import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  returnPetObject,
} from './mapper/return-pet.mapper';
import { CreatePetDto } from '../pet/dto/create-pet.dto';

@Injectable()
export class PetService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAllPets(userId: number) {
    const petList = await this.prisma.pet.findMany({
      where: {
        userId,
      },
      select: returnPetObject,
    });
    if (!petList) {
      return [];
    }
    return petList;
  }

  async createPet(petDto: CreatePetDto) {
    const { name, userId } = petDto;
    return await this.prisma.pet.create({
      data: {
        name,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
}
