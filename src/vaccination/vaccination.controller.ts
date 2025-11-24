// src/vaccination/vaccination.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import { GetVaccinationsQueryDto } from './dto/get-vaccinations-query.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { Resource } from '../common/decorators/resource.decorator';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('pets/:petId/vaccinations')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Post()
  @Auth()
  @Resource('pet')
  @UseGuards(OwnershipGuard)
  create(
      @Param('petId') petId: string,
      @Body() dto: CreateVaccinationDto,
      @CurrentUser() user: User,
  ) {
    return this.vaccinationService.createVaccination(user.id, +petId, dto);
  }

  @Get()
  @Auth()
  @Resource('pet')
  @UseGuards(OwnershipGuard)
  findAll(
      @Param('petId') petId: string,
      @Query() query: GetVaccinationsQueryDto,
  ) {
    return this.vaccinationService.findAllForPet(
        +petId,
        query,
    );
  }

  @Get(':id')
  @Auth()
  @Resource('vaccination')
  @UseGuards(OwnershipGuard)
  findOne(@Param('id') id: string) {
    return this.vaccinationService.findOne(+id);
  }

  @Patch(':id')
  @Auth()
  @Resource('vaccination')
  @UseGuards(OwnershipGuard)
  update(
      @Param('id') id: string,
      @Body() dto: UpdateVaccinationDto,
      @CurrentUser() user: User,
  ) {
    return this.vaccinationService.updateVaccination(user.id, +id, dto);
  }

  @Delete(':id')
  @Auth()
  @Resource('vaccination')
  @UseGuards(OwnershipGuard)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.vaccinationService.removeVaccination(user.id, +id);
  }
}