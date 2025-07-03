import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { MedicalServicesService } from './medicalServices.service';
import { ClinicSearchDto, CreateAppointmentDto } from './dto/medical-services.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('medical')
export class MedicalServicesController {
  constructor(private readonly medicalServices: MedicalServicesService) {}

  @Get('clinics')
  @Auth()
  async getClinics(@Query() searchParams: ClinicSearchDto) {
    return this.medicalServices.getAllClinics(searchParams);
  }

  @Get('clinics/:id')
  @Auth()
  async getClinic(@Param('id') id: number) {
    return this.medicalServices.getClinicDetails(id);
  }

  @Post('clinics/appointment')
  @Auth()
  async createClinicAppointment(@Body() appointmentData: CreateAppointmentDto) {
    return this.medicalServices.createClinicAppointment(appointmentData);
  }

  @Get('appointments/pet/:petId')
  @Auth()
  async getPetAppointments(@Param('petId') petId: number) {
    return this.medicalServices.getPetClinicHistory(petId);
  }

  @Get('appointments/:id')
  @Auth()
  async getAppointmentDetails(@Param('id') id: number) {
    return this.medicalServices.getAppointmentDetails(id);
  }
}