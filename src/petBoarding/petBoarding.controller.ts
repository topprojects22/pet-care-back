import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { PetBoardingService } from './petBoarding.service';
import { CreateBoardingBookingDto } from './dto/pet-boarding.dto';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('boarding')
export class PetBoardingController {
  constructor(private readonly boardingService: PetBoardingService) {}

  @Get()
  @Auth()
  async getBoardings(@Query() searchParams: string) {
    return this.boardingService.getAllPetBoardings(searchParams);
  }

  @Get(':id')
  @Auth()
  async getBoardingDetails(@Param('id') id: string) {
    return this.boardingService.getBoardingDetails(+id);
  }

  @Post('booking')
  @Auth()
  async createBooking(@Body() bookingData: CreateBoardingBookingDto) {
    return this.boardingService.createBoardingBooking(bookingData);
  }

  @Get('bookings/user/:userId')
  @Auth()
  async getUserBookings(@Param('userId') userId: string) {
    return this.boardingService.getUserBookings(+userId);
  }

  @Put('booking/:id/cancel')
  @Auth()
  async cancelBooking(@Param('id') id: string) {
    return this.boardingService.cancelBooking(+id);
  }
}