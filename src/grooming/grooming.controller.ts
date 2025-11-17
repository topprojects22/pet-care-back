import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { GroomingService } from './grooming.service';
import { CreateGroomingBookingDto } from './dto/grooming.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('grooming')
export class GroomingController {
  constructor(private readonly groomingService: GroomingService) {}

  @Get('services')
  @Auth()
  async getGroomingServices() {
    return this.groomingService.getGroomingServices();
  }

  @Post('booking')
  @Auth()
  async createGroomingBooking(@Body() bookingData: CreateGroomingBookingDto) {
    return this.groomingService.createGroomingBooking(bookingData);
  }

  @Get('history/pet/:petId')
  @Auth()
  async getPetGroomingHistory(@Param('petId') petId: string) {
    return this.groomingService.getPetGroomingHistory(+petId);
  }
}