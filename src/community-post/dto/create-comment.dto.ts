// src/community-post/dto/create-comment.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateCommentDto {
    @IsString()
    content!: string;

    @IsOptional()
    parentId?: number; // для ответов
}