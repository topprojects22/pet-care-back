// src/pet-boarding/pet-boarding.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { PetBoardingService } from './pet-boarding.service';
import { BookingService } from './booking.service';
import { CreatePetBoardingDto } from './dto/create-pet-boarding.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('pet-boarding')
export class PetBoardingController {
    constructor(
        private readonly boardingService: PetBoardingService,
        private readonly bookingService: BookingService,
    ) {}

    // Создать объявление о передержке
    @Post()
    @Auth()
    createListing(@Body() dto: CreatePetBoardingDto, @Req() req) {
        return this.boardingService.createListing(req.user.id, dto);
    }

    // Список всех активных передержек
    @Get()
    findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('user') userId?: string,
    ) {
        return this.boardingService.findAllActive({
            page: page ? +page : undefined,
            limit: limit ? +limit : undefined,
            userId: userId ? +userId : undefined,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.boardingService.findOne(+id);
    }

    // Забронировать
    @Post(':id/book')
    @Auth()
    book(@Param('id') id: string, @Body() dto: CreateBookingDto, @Req() req) {
        return this.bookingService.createBooking(req.user.id, +id, dto);
    }

    // Подтвердить бронь (владелец или гость)
    @Patch(':id/bookings/:bookingId/confirm')
    @Auth()
    confirmBooking(@Param('bookingId') bookingId: string, @Req() req) {
        return this.bookingService.confirmBooking(req.user.id, +bookingId);
    }

    // Мои бронирования
    @Get('my-bookings')
    @Auth()
    myBookings(@Req() req, @Query('role') role: 'owner' | 'guest' = 'guest') {
        return this.bookingService.getBookingsForUser(req.user.id, role);
    }
}