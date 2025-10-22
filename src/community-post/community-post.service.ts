// src/community-post/community-post.service.ts
import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { UpdateCommunityPostDto } from './dto/update-community-post.dto';
import { PostType } from '@prisma/client';

@Injectable()
export class CommunityPostService {
    constructor(private prisma: PrismaService) {}

    async createPost(userId: number, dto: CreateCommunityPostDto) {
        // Проверка: если указан shelterId — убедиться, что пользователь владеет приютом
        if (dto.shelterId) {
            const shelter = await this.prisma.shelter.findUnique({
                where: { id: dto.shelterId },
            });
            if (!shelter || shelter.ownerId !== userId) {
                throw new ForbiddenException('You do not own this shelter');
            }
        }

        // Для личных постов (BLOG) — shelterId = null
        const data: any = {
            title: dto.title,
            content: dto.content,
            mediaUrls: dto.mediaUrls ?? [],
            postType: dto.postType,
            location: dto.location,
            eventDate: dto.eventDate,
            isPinned: false,
            author: dto.shelterId ? undefined : { connect: { id: userId } },
            shelter: dto.shelterId ? { connect: { id: dto.shelterId } } : undefined,
        };

        return this.prisma.communityPost.create({ data });
    }

    async findAll(query: { type?: PostType; page?: number; limit?: number }) {
        const { type, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        return this.prisma.communityPost.findMany({
            where: {
                ...(type && { postType: type }),
                OR: [{ author: { isNot: null } }, { shelter: { isNot: null } }],
            },
            include: {
                author: { select: { id: true, name: true, avatarPath: true } },
                shelter: { select: { id: true, name: true, photos: true } },
                _count: { select: { likes: true, comments: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
    }

    async findOne(id: number) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id },
            include: {
                author: { select: { id: true, name: true, avatarPath: true } },
                shelter: { select: { id: true, name: true } },
                likes: { select: { userId: true } },
                comments: {
                    where: { parentId: null },
                    include: {
                        user: { select: { id: true, name: true, avatarPath: true } },
                        replies: {
                            include: {
                                user: { select: { id: true, name: true, avatarPath: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

    async updatePost(userId: number, postId: number, dto: UpdateCommunityPostDto) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id: postId },
        });

        if (!post) throw new NotFoundException('Post not found');

        // Проверка прав: автор или владелец приюта
        const isAuthor = post.authorId === userId;
        const isShelterOwner = post.shelterId
            ? await this.prisma.shelter.findFirst({
                where: { id: post.shelterId, ownerId: userId },
            })
            : false;

        if (!isAuthor && !isShelterOwner) {
            throw new ForbiddenException('Not authorized to edit this post');
        }

        return this.prisma.communityPost.update({
            where: { id: postId },
            data: dto,
        });
    }

    async removePost(userId: number, postId: number) {
        const post = await this.findOne(postId);
        // та же логика проверки прав
        // ... (аналогично update)

        return this.prisma.communityPost.delete({ where: { id: postId } });
    }
}