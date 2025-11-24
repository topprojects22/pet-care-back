// src/medication/medication.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { MedicationService } from './medication.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller('pets/:petId/medications')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Post()
  @Auth()
  create(
      @Param('petId') petId: string,
      @Body() dto: CreateMedicationDto,
      @CurrentUser() user: User,
  ) {
    return this.medicationService.createMedication(user.id, +petId, dto);
  }

  @Get()
  findAll(
      @Param('petId') petId: string,
      @Query('active') active?: string,
  ) {
    return this.medicationService.findAllForPet(+petId, active === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationService.findOne(+id);
  }

  @Patch(':id')
  @Auth()
  update(
      @Param('id') id: string,
      @Body() dto: UpdateMedicationDto,
      @CurrentUser() user: User,
  ) {
    return this.medicationService.updateMedication(user.id, +id, dto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.medicationService.removeMedication(user.id, +id);
  }
}