// src/review/review.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from "../common/decorators/user.decorator";
import { User } from "@prisma/client";

@Controller('clinics/:clinicId/reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    @Auth()
    create(
        @Param('clinicId') clinicId: string,
        @Body() dto: CreateReviewDto,
        @CurrentUser() user: User,
    ) {
        return this.reviewService.createReview(user.id, +clinicId, dto);
    }

    @Get()
    findAll(
        @Param('clinicId') clinicId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.reviewService.findAllForClinic(
            +clinicId,
            page ? +page : undefined,
            limit ? +limit : undefined,
        );
    }

    // Опционально: удаление
    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.reviewService.removeReview(user.id, +id);
    }
}