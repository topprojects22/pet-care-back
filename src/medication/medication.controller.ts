// src/medication/medication.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { MedicationService } from './medication.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pets/:petId/medications')
export class MedicationController {
  constructor(private readonly medicationService: MedicationService) {}

  @Post()
  @Auth()
  create(
      @Param('petId') petId: string,
      @Body() dto: CreateMedicationDto,
      @Req() req,
  ) {
    return this.medicationService.createMedication(req.user.id, +petId, dto);
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
      @Req() req,
  ) {
    return this.medicationService.updateMedication(req.user.id, +id, dto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @Req() req) {
    return this.medicationService.removeMedication(req.user.id, +id);
  }
}