// src/community-post/community-post.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Req,
    Query,
    Patch,
    Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CommunityPostService } from './community-post.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { LikeService } from './like.service';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostType } from '@prisma/client';

@Controller('community-posts')
export class CommunityPostController {
    constructor(
        private readonly postService: CommunityPostService,
        private readonly likeService: LikeService,
        private readonly commentService: CommentService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateCommunityPostDto, @Req() req) {
        return this.postService.createPost(req.user.id, dto);
    }

    @Get()
    findAll(@Query('type') type?: PostType, @Query('page') page?: number, @Query('limit') limit?: number) {
        return this.postService.findAll({ type, page: page ? +page : undefined, limit: limit ? +limit : undefined });
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.postService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() dto: UpdateCommunityPostDto, @Req() req) {
        return this.postService.updatePost(req.user.id, +id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string, @Req() req) {
        return this.postService.removePost(req.user.id, +id);
    }

    // Лайки
    @Post(':id/like')
    @UseGuards(JwtAuthGuard)
    like(@Param('id') id: string, @Req() req) {
        return this.likeService.toggleLike(req.user.id, +id);
    }

    // Комментарии
    @Post(':id/comments')
    @UseGuards(JwtAuthGuard)
    comment(@Param('id') id: string, @Body() dto: CreateCommentDto, @Req() req) {
        return this.commentService.createComment(req.user.id, +id, dto);
    }
}