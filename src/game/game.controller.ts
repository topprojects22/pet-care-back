import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetAllGameDto } from './dto/get-all.game.dto';
import { GameDto } from './dto/game.dto';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Get()
  async getAll(@Query() queryDto: GetAllGameDto) {
    return this.gameService.getAll(queryDto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('create')
  @Auth()
  async createGame(@Body() gameDto: GameDto) {
    return this.gameService.createGame(gameDto);
  }
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put('update/:id')
  @Auth()
  async updateGame(@Param() id: number, @Body() gameDto: GameDto) {
    return this.gameService.updateGame(id, gameDto);
  }
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Put('delete/:id')
  @Auth()
  async deleteGame(@Param() id: number) {
    return this.gameService.deleteGame(id);
  }
}
