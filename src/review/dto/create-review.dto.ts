// src/review/dto/create-review.dto.ts
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number; // 1–5

    @IsString()
    @IsOptional()
    comment?: string; // до 1000 символов (валидация в сервисе или Prisma)
}