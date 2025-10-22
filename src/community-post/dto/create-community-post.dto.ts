// src/community-post/dto/create-community-post.dto.ts
import { IsString, IsOptional, IsEnum, IsArray, IsDate, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { PostType } from '@prisma/client'; // импортируем enum из сгенерированного Prisma

export class CreateCommunityPostDto {
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    mediaUrls?: string[];

    @IsEnum(PostType)
    postType: PostType;

    @IsString()
    @IsOptional()
    location?: string;

    @ValidateIf(o => o.postType === 'EVENT')
    @Type(() => Date)
    @IsDate()
    eventDate?: Date;

    // ВАЖНО: shelterId передаётся ТОЛЬКО если postType = ADOPTION или ANNOUNCEMENT
    @ValidateIf(o => ['ADOPTION', 'ANNOUNCEMENT'].includes(o.postType))
    @IsOptional()
    shelterId?: number;
}