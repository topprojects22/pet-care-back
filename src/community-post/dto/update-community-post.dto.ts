// src/community-post/dto/update-community-post.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityPostDto } from './create-community-post.dto';

export class UpdateCommunityPostDto extends PartialType(CreateCommunityPostDto) {}