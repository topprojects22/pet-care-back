import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { PrismaService } from '../prisma.service';
import { PaginationService } from '../pagination/pagination.service';

@Module({
  controllers: [GameController],
  providers: [GameService, PrismaService, PaginationService],
})
export class GameModule {}
