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
  Req,
  Query,
} from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { CreateVaccinationDto } from './dto/create-vaccination.dto';
import { UpdateVaccinationDto } from './dto/update-vaccination.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pets/:petId/vaccinations')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Post()
  @Auth()
  create(
      @Param('petId') petId: string,
      @Body() dto: CreateVaccinationDto,
      @Req() req,
  ) {
    return this.vaccinationService.createVaccination(req.user.id, +petId, dto);
  }

  @Get()
  findAll(
      @Param('petId') petId: string,
      @Query('future') future?: string,
  ) {
    return this.vaccinationService.findAllForPet(+petId, future === 'true');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vaccinationService.findOne(+id);
  }

  @Patch(':id')
  @Auth()
  update(
      @Param('id') id: string,
      @Body() dto: UpdateVaccinationDto,
      @Req() req,
  ) {
    return this.vaccinationService.updateVaccination(req.user.id, +id, dto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @Req() req) {
    return this.vaccinationService.removeVaccination(req.user.id, +id);
  }
}