// src/community-post/community-post.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
    Patch,
    Delete,
} from '@nestjs/common';
import { CommunityPostService } from './community-post.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { LikeService } from './like.service';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PostType } from '@prisma/client';
import { Auth } from "../auth/decorators/auth.decorator";
import { CurrentUser } from '../common/decorators/user.decorator';
import { User } from '@prisma/client';

@Controller('community-posts')
export class CommunityPostController {
    constructor(
        private readonly postService: CommunityPostService,
        private readonly likeService: LikeService,
        private readonly commentService: CommentService,
    ) {}

    @Post()
    @Auth()
    create(@Body() dto: CreateCommunityPostDto, @CurrentUser() user: User) {
        return this.postService.createPost(user.id, dto);
    }

    @Get()
    findAll(@Query('type') type?: PostType, @Query('page') page?: number, @Query('limit') limit?: number) {
        return this.postService.findAll({ type, page: page ? +page : undefined, limit: limit ? +limit : undefined });
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user?: User) {
        return this.postService.findOne(+id, user?.id);
    }

    @Patch(':id')
    @Auth()
    update(@Param('id') id: string, @Body() dto: UpdateCommunityPostDto, @CurrentUser() user: User) {
        return this.postService.updatePost(user.id, +id, dto);
    }

    @Delete(':id')
    @Auth()
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.postService.removePost(user.id, +id);
    }

    // Лайки
    @Post(':id/like')
    @Auth()
    like(@Param('id') id: string, @CurrentUser() user: User) {
        return this.likeService.toggleLike(user.id, +id);
    }

    // Комментарии
    @Post(':id/comments')
    @Auth()
    comment(@Param('id') id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: User) {
        return this.commentService.createComment(user.id, +id, dto);
    }

    // Репост
    @Post(':id/repost')
    @Auth()
    repost(
        @Param('id') id: string,
        @Body() body: { comment?: string },
        @CurrentUser() user: User,
    ) {
        return this.postService.repostPost(user.id, +id, body.comment);
    }
}