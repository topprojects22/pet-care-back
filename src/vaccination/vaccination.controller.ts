import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { VaccinationService } from './vaccination.service';
import { CreateVaccinationDto } from './dto/vaccination.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('vaccination')
export class VaccinationController {
  constructor(private readonly vaccinationService: VaccinationService) {}

  @Post()
  @Auth()
  async createVaccination(@Body() vaccinationData: CreateVaccinationDto) {
    return this.vaccinationService.addVaccination(
      vaccinationData.petId,
      vaccinationData,
    );
  }

  @Delete(':id')
  @Auth()
  async deleteVaccination(@Param('id') id: string) {
    return this.vaccinationService.deleteVaccination(+id);
  }
}