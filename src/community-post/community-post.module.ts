// src/community-post/community-post.module.ts
import { Module } from '@nestjs/common';
import { CommunityPostController } from './community-post.controller';
import { CommunityPostService } from './community-post.service';
import { CommentService } from './comment.service';
import { LikeService } from './like.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShelterModule } from 'src/shelter/shelter.module'; // для валидации shelterId

@Module({
    imports: [ShelterModule], // если нужно делегировать проверку приюта
    controllers: [CommunityPostController],
    providers: [CommunityPostService, CommentService, LikeService, PrismaService],
    exports: [CommunityPostService],
})
export class CommunityPostModule {}