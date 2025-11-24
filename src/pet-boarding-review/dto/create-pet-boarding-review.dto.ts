// src/pet-boarding-review/dto/create-pet-boarding-review.dto.ts
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreatePetBoardingReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number; // 1–5

    @IsString()
    @IsOptional()
    comment?: string;
}