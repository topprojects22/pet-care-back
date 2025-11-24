// src/pet-boarding-review/pet-boarding-review.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Query,
} from '@nestjs/common';
import { PetBoardingReviewService } from './pet-boarding-review.service';
import { CreatePetBoardingReviewDto } from './dto/create-pet-boarding-review.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller('pet-boarding/bookings/:bookingId/review')
export class PetBoardingReviewController {
    constructor(private readonly reviewService: PetBoardingReviewService) {}

    @Post()
    @Auth()
    create(
        @Param('bookingId') bookingId: string,
        @Body() dto: CreatePetBoardingReviewDto,
        @CurrentUser() user: User,
    ) {
        return this.reviewService.createReview(user.id, +bookingId, dto);
    }

    @Get()
    findAll(
        @Param('boardingId') boardingId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.reviewService.findAllForBoarding(
            +boardingId,
            page ? +page : undefined,
            limit ? +limit : undefined,
        );
    }
}