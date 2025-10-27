// src/review/review.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import {Auth} from "../auth/decorators/auth.decorator";

@Controller('clinics/:clinicId/reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    @Auth()
    create(
        @Param('clinicId') clinicId: string,
        @Body() dto: CreateReviewDto,
        @Req() req,
    ) {
        return this.reviewService.createReview(req.user.id, +clinicId, dto);
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
    remove(@Param('id') id: string, @Req() req) {
        return this.reviewService.removeReview(req.user.id, +id);
    }
}