import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PetService } from './pet.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { RequestPetDto } from './dto/request-pet.dto';
import { CreatePetDto } from './dto/create-pet.dto';
import { PetDto } from './dto/pet.dto';

@Controller('pet')
export class PetController {
  constructor(private readonly petService: PetService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('get')
  @Auth()
  async getAll(@Body() petDto: RequestPetDto) {
    return this.petService.getAll(petDto.userId);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('create')
  @Auth()
  async createPet(@Body() petDto: CreatePetDto) {
    return this.petService.createPet(petDto);
  }
}
