// src/pet-boarding/pet-boarding.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Query,
} from '@nestjs/common';
import { PetBoardingService } from './pet-boarding.service';
import { BookingService } from './booking.service';
import { CreatePetBoardingDto } from './dto/create-pet-boarding.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BoardingSearchDto } from './dto/boarding-search.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('pet-boarding')
export class PetBoardingController {
    constructor(
        private readonly boardingService: PetBoardingService,
        private readonly bookingService: BookingService,
    ) {}

    // Создать объявление о передержке
    @Post()
    @Auth()
    createListing(@Body() dto: CreatePetBoardingDto, @CurrentUser() user: User) {
        return this.boardingService.createListing(user.id, dto);
    }

    // Список всех активных передержек с поиском и фильтрацией
    @Get()
    findAll(@Query() searchParams: BoardingSearchDto) {
        return this.boardingService.findAllActive({
            page: searchParams.page,
            limit: searchParams.limit,
            city: searchParams.city,
            maxPrice: searchParams.maxPrice,
            minPrice: searchParams.minPrice,
            acceptsCats: searchParams.acceptsCats,
            acceptsDogs: searchParams.acceptsDogs,
        });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.boardingService.findOne(+id);
    }

    // Забронировать
    @Post(':id/book')
    @Auth()
    book(@Param('id') id: string, @Body() dto: CreateBookingDto, @CurrentUser() user: User) {
        return this.bookingService.createBooking(user.id, +id, dto);
    }

    // Подтвердить бронь (владелец или гость)
    @Patch(':id/bookings/:bookingId/confirm')
    @Auth()
    confirmBooking(@Param('bookingId') bookingId: string, @CurrentUser() user: User) {
        return this.bookingService.confirmBooking(user.id, +bookingId);
    }

    // Мои бронирования
    @Get('my-bookings')
    @Auth()
    myBookings(@CurrentUser() user: User, @Query('role') role: 'owner' | 'guest' = 'guest') {
        return this.bookingService.getBookingsForUser(user.id, role);
    }
}