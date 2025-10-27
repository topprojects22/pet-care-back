import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

// src/community-post/like.service.ts
@Injectable()
export class LikeService {
    constructor(private prisma: PrismaService) {}

    async toggleLike(userId: number, postId: number) {
        const existing = await this.prisma.postLike.findUnique({
            where: { postId_userId: { postId, userId } },
        });

        if (existing) {
            await this.prisma.postLike.delete({ where: { postId_userId: { postId, userId } } });
            return { liked: false };
        } else {
            await this.prisma.postLike.create({ data: { postId, userId } });
            return { liked: true };
        }
    }
}