import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  returnGameObject,
  returnGameObjectFull,
} from './dto/return-game.object';
import { GameDto } from './dto/game.dto';
import { slugify } from '../utils/generate-slug';
import { EnumGameSort, GetAllGameDto } from './dto/get-all.game.dto';
import { PaginationService } from '../pagination/pagination.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationService: PaginationService,
  ) {}

  async getGame(id: number) {
    const game = await this.prisma.game.findUnique({
      where: {
        id,
      },
      select: returnGameObjectFull,
    });
    if (!game) {
      throw new NotFoundException('Game not found');
    }
    return game;
  }

  async createGame(gameDto: GameDto) {
    const { name, value, size, userId } = gameDto;
    return await this.prisma.game.create({
      data: {
        name,
        value,
        size,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
  async updateGame(gameId: number, gameDto: GameDto) {
    const { name, value, size, userId } = gameDto;
    return await this.prisma.game.update({
      where: {
        id: gameId,
      },
      data: {
        name,
        value,
        size,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }
  async deleteGame(gameId: number) {
    return await this.prisma.game.delete({
      where: {
        id: gameId,
      },
    });
  }

  async getAll(getAllGameDto: GetAllGameDto = {}) {
    const { sort, searchItem } = getAllGameDto;

    const prismaSort: Prisma.GameOrderByWithRelationInput[] = [];

    if (sort === EnumGameSort.START_DATE) {
      prismaSort.push({ createdAt: 'asc' });
    } else if (sort === EnumGameSort.END_DATE) {
      prismaSort.push({ createdAt: 'desc' });
    }

    const prismaSearchTermFilter: Prisma.GameWhereInput = searchItem
      ? {
          OR: [
            {
              name: {
                contains: searchItem,
                mode: 'insensitive',
              },
            },
          ],
        }
      : {};

    const { perPage, skip } =
      this.paginationService.getPagination(getAllGameDto);
    const games = await this.prisma.game.findMany({
      where: prismaSearchTermFilter,
      orderBy: prismaSort,
      skip,
      take: perPage,
    });
    const count = await this.prisma.game.count({
      where: prismaSearchTermFilter,
    });
    return { games, count };
  }
}
