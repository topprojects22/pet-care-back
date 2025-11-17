/**
 * ПРИМЕР: Улучшенный контроллер с использованием новых компонентов
 * 
 * Этот файл демонстрирует, как можно улучшить существующие контроллеры,
 * используя новые декораторы, типы и обработку ошибок.
 * 
 * НЕ ИСПОЛЬЗУЙТЕ ЭТОТ ФАЙЛ НАПРЯМУЮ - это только пример для рефакторинга
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PetService } from './pet.service';
import {
  CreatePetDto,
  UpdatePetDto,
  CreatePetPassportDto,
} from './dto/pet.dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Resource } from '../common/decorators/resource.decorator';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { UseGuards } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from '@prisma/client';
import { ResourceNotFoundException } from '../common/exceptions/business.exception';

@ApiTags('Pets')
@ApiBearerAuth('JWT-auth')
@Controller('pet')
export class PetControllerImproved {
  constructor(private readonly petService: PetService) {}

  @Get('user')
  @Auth()
  @ApiOperation({ summary: 'Get all pets for current user' })
  @ApiResponse({ status: 200, description: 'List of user pets' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPets(
    @CurrentUser() user: User,
    @Query() pagination: PaginationDto,
  ) {
    // Примечание: getUserPets может быть обновлен для поддержки пагинации
    return this.petService.getUserPets(user.id);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get pet by ID' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Pet details' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async getPet(@Param('id') id: string) {
    const pet = await this.petService.getPetWithDetails(+id);
    if (!pet) {
      throw new ResourceNotFoundException('Pet', +id);
    }
    return pet;
  }

  @Post()
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new pet' })
  @ApiResponse({ status: 201, description: 'Pet created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createPet(
    @Body() petData: CreatePetDto,
    @CurrentUser() user: User,
  ) {
    return this.petService.createPet(petData, user.id);
  }

  @Put(':id')
  @Auth()
  @Resource('pet')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Update pet information' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 200, description: 'Pet updated successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async updatePet(
    @Param('id') id: string,
    @Body() petData: UpdatePetDto,
  ) {
    return this.petService.updatePet(+id, petData);
  }

  @Delete(':id')
  @Auth()
  @Resource('pet')
  @UseGuards(OwnershipGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a pet' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiResponse({ status: 204, description: 'Pet deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Pet not found' })
  async deletePet(@Param('id') id: string) {
    await this.petService.deletePet(+id);
  }

  @Get('passport/:petId')
  @Auth()
  @ApiOperation({ summary: 'Get pet passport' })
  @ApiParam({ name: 'petId', type: 'number' })
  async getPetPassport(@Param('petId') petId: string) {
    const passport = await this.petService.getPetPassport(+petId);
    if (!passport) {
      throw new ResourceNotFoundException('Pet passport', +petId);
    }
    return passport;
  }

  @Post('passport')
  @Auth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create pet passport' })
  async createPetPassport(@Body() passportData: CreatePetPassportDto) {
    return this.petService.createPetPassport(passportData);
  }

  @Get(':id/medications')
  @Auth()
  @ApiOperation({ summary: 'Get pet medications' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPetMedications(
    @Param('id') petId: string,
    @Query() pagination: PaginationDto,
  ) {
    // Примечание: getPetMedications может быть обновлен для поддержки пагинации
    return this.petService.getPetMedications(+petId);
  }

  @Get(':id/vaccinations')
  @Auth()
  @ApiOperation({ summary: 'Get pet vaccinations' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPetVaccinations(
    @Param('id') petId: string,
    @Query() pagination: PaginationDto,
  ) {
    // Примечание: getPetVaccinations может быть обновлен для поддержки пагинации
    return this.petService.getPetVaccinations(+petId);
  }
}

