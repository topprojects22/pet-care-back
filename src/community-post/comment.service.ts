import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { CreateCommentDto } from "./dto/create-comment.dto";

// src/community-post/comment.service.ts
@Injectable()
export class CommentService {
    constructor(private prisma: PrismaService) {}

    async createComment(userId: number, postId: number, dto: CreateCommentDto) {
        return this.prisma.postComment.create({
            data: {
                postId,
                userId,
                content: dto.content,
                parentId: dto.parentId,
            },
        });
    }
}